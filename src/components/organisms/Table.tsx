import cn from "classnames";
import { ReactNode } from "react";

const Table = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full overflow-x-auto p-3 rounded-xl bg-quaternary-fill/3">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
};

const Body = ({ children }: { children: ReactNode }) => {
  return <tbody>{children}</tbody>;
};

const Row = ({ children }: { children: ReactNode }) => {
  return <tr className="border-[0.5] border-quinary-label/5">{children}</tr>;
};

const Cell = ({
  children,
  onClick,
  align = "left",
}: {
  children: ReactNode;
  onClick?: () => void;
  align?: "left" | "center" | "right";
}) => {
  return (
    <td
      role={onClick ? "button" : undefined}
      onClick={onClick}
      style={{ textAlign: align }}
      className={`py-1 text-primary-label text-sm ${cn(onClick && "cursor-pointer")}`}
    >
      {children}
    </td>
  );
};

Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;

export default Table;
