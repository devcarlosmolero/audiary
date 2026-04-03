import Input from "../atoms/Input";
import Select from "../atoms/Select";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: "text" | "select";
  slot?: React.ReactNode;
  options?: { label: string; value: string }[];
}

export function FormField({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  slot,
  options,
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  if (type === "select" && options) {
    return (
      <Select
        label={label}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        options={options}
      />
    );
  }
  return <Input label={label} value={value} onChange={handleChange} _slot={slot} onBlur={onBlur} />;
}
