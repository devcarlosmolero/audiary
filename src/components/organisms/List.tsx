import cn from "classnames";
import { ReactNode } from "react";

import { useFocusStore } from "../../hooks/useFocusStore";

interface ListProps {
  children: ReactNode;
  className?: string;
}

const List = ({ children, className }: ListProps) => {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
};

const Body = ({ children }: { children: ReactNode }) => {
  return <tbody>{children}</tbody>;
};

const Row = ({
  children,
  onClick,
  rowId,
}: {
  children: ReactNode;
  onClick?: () => void;
  rowId: string;
}) => {
  const { focusedRowId, setFocusedRowId } = useFocusStore();

  return (
    <tr
      role={onClick ? "button" : undefined}
      onClick={() => setFocusedRowId(rowId)}
      onDoubleClick={onClick}
      className={`${cn(
        focusedRowId === rowId ? "bg-[#2962D9]! text-white-label" : "text-primary-label",
        "even:bg-quaternary-fill/3",
      )}`}
    >
      {children}
    </tr>
  );
};

const Cell = ({
  children,
  align = "left",
  isFirst,
  isLast,
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  return (
    <td
      style={{ textAlign: align }}
      className={`w-fit text-sm cursor-default px-4 ${cn(isFirst && "rounded-l-xl", isLast && "rounded-r-xl")}`}
    >
      {children}
    </td>
  );
};

List.Body = Body;
List.Row = Row;
List.Cell = Cell;

export default List;
