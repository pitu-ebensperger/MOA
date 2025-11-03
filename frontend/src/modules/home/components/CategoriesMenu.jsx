import React, { useState } from "react";

export default function CategoriesMenu({ categories = [] }) {
  const [active, setActive] = useState(categories[0]?.id ?? "all");

  return (
    <section className="bg-white border-t border-[var(--line)]">
      <div className="container-px mx-auto py-6">
        <div className="ui-sans flex flex-wrap items-center gap-3 text-sm">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`rounded-full px-4 py-2 transition-colors
                ${active === c.id
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--card)] text-[var(--text-weak)] hover:text-[var(--text)]"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
