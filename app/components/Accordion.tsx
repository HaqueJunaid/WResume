import type { ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import clsx from "clsx";

interface AccordionContextType {
  activeItems: string[];
  toggleItem: (id: string) => void;
  isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = "",
}) => {
  const [activeItems, setActiveItems] = useState<string[]>(
    defaultOpen ? [defaultOpen] : []
  );

  const toggleItem = (id: string) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  const isItemActive = (id: string) => activeItems.includes(id);

  return (
    <AccordionContext.Provider
      value={{ activeItems, toggleItem, isItemActive }}
    >
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  children,
  className = "",
}) => {
  return (
    <div className={`overflow-hidden border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

interface AccordionHeaderProps {
  itemId: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right",
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  const defaultIcon = (
    <svg
      className={clsx("w-5 h-5 transition-transform duration-200", {
        "rotate-180": isActive,
      })}
      fill="none"
      stroke="#98A2B3"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const handleClick = () => {
    toggleItem(itemId);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex flex-wrap items-center gap-3 cursor-pointer
        ${className}
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {iconPosition === "left" && (icon || defaultIcon)}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      {iconPosition === "right" && (
        <div className="shrink-0">{icon || defaultIcon}</div>
      )}
    </button>
  );
};

interface AccordionContentProps {
  itemId: string;
  children: ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  itemId,
  children,
  className = "",
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const updateHeight = () => {
      setHeight(node.scrollHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(node);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "opacity-100" : "opacity-0"}
        ${className}
      `}
      style={{ maxHeight: isActive ? height : 0 }}
    >
      <div ref={contentRef} className="px-4 py-3 ">
        {children}
      </div>
    </div>
  );
};