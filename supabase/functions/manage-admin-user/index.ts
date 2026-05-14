import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

type AdminRole = "owner" | "staff" | "followup"

type RequestBody = {
  action: "create" | "update" | "deactivate" | "reactivate"
  userId?: string
  email?: string
  password?: string
  fullName?: string
  role?: AdminRole
  isActive?: boolean
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  })
}

function assertRole(role: unknown): asserts role is AdminRole {
  if (role !== "owner" && role !== "staff" && role !== "followup") {
    throw new Error("Rol inválido.")
  }
}

function normalizeEmail(email: string | undefined) {
  return String(email ?? "").trim().toLowerCase()
}

function normalizeName(name: string | undefined) {
  return String(name ?? "").trim()
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Faltan variables de entorno de Supabase.")
    }

    const authorization = req.headers.get("Authorization") ?? ""
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user: actor },
      error: actorError,
    } = await userClient.auth.getUser()

    if (actorError || !actor) {
      return jsonResponse({ error: "Sesión inválida." }, 401)
    }

    const { data: actorProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", actor.id)
      .single()

    if (
      profileError ||
      !actorProfile ||
      !["admin", "owner"].includes(actorProfile.role) ||
      actorProfile.is_active === false
    ) {
      return jsonResponse({ error: "Solo la dueña puede administrar usuarios." }, 403)
    }

    const body = (await req.json()) as RequestBody
    const action = body.action

    if (!["create", "update", "deactivate", "reactivate"].includes(action)) {
      return jsonResponse({ error: "Acción inválida." }, 400)
    }

    let targetUserId = body.userId ?? ""
    let targetEmail = normalizeEmail(body.email)
    let details: Record<string, unknown> = {}

    if (action === "create") {
      assertRole(body.role)

      const fullName = normalizeName(body.fullName)

      if (!fullName) throw new Error("Ingresa el nombre.")
      if (!targetEmail.includes("@")) throw new Error("Ingresa un correo válido.")
      if (!body.password || body.password.length < 8) {
        throw new Error("La contraseña temporal debe tener al menos 8 caracteres.")
      }

      const { data: createdUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email: targetEmail,
          password: body.password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        })

      if (createError || !createdUser.user) {
        throw new Error(createError?.message ?? "No se pudo crear el usuario.")
      }

      targetUserId = createdUser.user.id

      const { error: upsertError } = await adminClient.from("profiles").upsert({
        id: targetUserId,
        full_name: fullName,
        email: targetEmail,
        role: body.role,
        is_active: body.isActive ?? true,
        updated_at: new Date().toISOString(),
      })

      if (upsertError) throw new Error(upsertError.message)

      details = { role: body.role, fullName, isActive: body.isActive ?? true }
    }

    if (action === "update") {
      if (!targetUserId) throw new Error("Usuario inválido.")
      assertRole(body.role)

      const fullName = normalizeName(body.fullName)
      if (!fullName) throw new Error("Ingresa el nombre.")

      const updateAuthPayload: Record<string, unknown> = {
        user_metadata: { full_name: fullName },
      }

      if (targetEmail) {
        updateAuthPayload.email = targetEmail
        updateAuthPayload.email_confirm = true
      }

      if (body.password) {
        if (body.password.length < 8) {
          throw new Error("La contraseña temporal debe tener al menos 8 caracteres.")
        }
        updateAuthPayload.password = body.password
      }

      const { error: authUpdateError } =
        await adminClient.auth.admin.updateUserById(
          targetUserId,
          updateAuthPayload
        )

      if (authUpdateError) throw new Error(authUpdateError.message)

      const { error: profileUpdateError } = await adminClient
        .from("profiles")
        .update({
          full_name: fullName,
          email: targetEmail || null,
          role: body.role,
          is_active: body.isActive ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId)

      if (profileUpdateError) throw new Error(profileUpdateError.message)

      details = {
        role: body.role,
        fullName,
        email: targetEmail || null,
        isActive: body.isActive ?? true,
        passwordChanged: Boolean(body.password),
      }
    }

    if (action === "deactivate" || action === "reactivate") {
      if (!targetUserId) throw new Error("Usuario inválido.")
      if (targetUserId === actor.id) {
        throw new Error("No puedes desactivar tu propio acceso.")
      }

      const isActive = action === "reactivate"

      const { error: authError } = await adminClient.auth.admin.updateUserById(
        targetUserId,
        { ban_duration: isActive ? "none" : "876000h" }
      )

      if (authError) throw new Error(authError.message)

      const { data: profile, error: profileUpdateError } = await adminClient
        .from("profiles")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId)
        .select("email")
        .single()

      if (profileUpdateError) throw new Error(profileUpdateError.message)

      targetEmail = profile?.email ?? targetEmail
      details = { isActive }
    }

    await adminClient.from("admin_user_audit_logs").insert({
      target_user_id: targetUserId,
      target_email: targetEmail || null,
      action,
      actor_id: actor.id,
      actor_email: actor.email ?? null,
      details,
    })

    return jsonResponse({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado."
    return jsonResponse({ error: message }, 400)
  }
})
