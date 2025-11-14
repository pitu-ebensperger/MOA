import clsx from "clsx";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const AccordionSection = ({ title, children, defaultOpen = false, className }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <section className={clsx("border-b border-(--color-secondary2)", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-4 text-left text-(--color-primary1)"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium">{title}</span>
        <ChevronDown
          className={clsx(
            "size-4 text-neutral-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {isOpen && (
        <div className="pb-6 text-sm leading-relaxed text-neutral-600">{children}</div>
      )}
    </section>
  );
};

export const Accordion = ({ sections = [], className }) => (
  <div className={clsx("space-y-2", className)}>
    {sections.map((section, index) => (
      <AccordionSection
        key={section.key ?? section.title ?? index}
        title={section.title}
        defaultOpen={Boolean(section.defaultOpen)}
      >
        {section.render ? section.render() : section.content}
      </AccordionSection>
    ))}
  </div>
);

export const AccordionItem = AccordionSection;


