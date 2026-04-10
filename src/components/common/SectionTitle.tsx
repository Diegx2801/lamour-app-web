type SectionTitleProps = {
  eyebrow: string
  title: string
  description?: string
}

function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="mb-10">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-stone-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default SectionTitle