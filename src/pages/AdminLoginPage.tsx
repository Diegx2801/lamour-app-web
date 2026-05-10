import { useState } from "react"
import { useNavigate } from "react-router"
import { supabase } from "../lib/supabase"

function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Credenciales incorrectas")
      return
    }

    // login correcto → ir al panel
navigate("/admin/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f1e9]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Admin Login
        </h1>

        <label htmlFor="admin-email" className="sr-only">
          Correo
        </label>
        <input
          id="admin-email"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 border rounded-xl"
        />

        <div className="relative mb-4">
          <label htmlFor="admin-password" className="sr-only">
            Contraseña
          </label>
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-16 border rounded-xl"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-600"
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <button className="w-full bg-stone-950 text-white py-3 rounded-xl">
          Iniciar sesión
        </button>
      </form>
    </div>
  )
}

export default AdminLoginPage
