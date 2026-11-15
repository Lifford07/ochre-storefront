import { pathNames } from "@/config/house"

/** The six steps. `material` replaces the second word for a line (Metal, Finish, Cloth). */
export function PathRail({ at, material = "Material" }: { at: number; material?: string }) {
  const names = pathNames.map((name, index) => (index === 1 ? material : name))
  const now = names[at] ?? names[0]
  const next = names[at + 1]
  return (
    <div className="path" data-at={at}>
      <ol className="path__bar">
        {names.map((name, index) => (
          <li key={name} className={index === at ? "at" : index < at ? "done" : ""}>
            <i />
            <span>{name}</span>
          </li>
        ))}
      </ol>
      <p className="path__now mono">
        <span className="path__n">{String(at + 1).padStart(2, "0")}</span>
        <b>{now}</b>
        {next ? <span className="path__next">Next · {next}</span> : null}
      </p>
    </div>
  )
}
