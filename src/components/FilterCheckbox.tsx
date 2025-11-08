import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const FilterCheckbox = ({
  label,
  checked,
  onCheckedChange,
}: FilterCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="border-sidebar-border data-[state=checked]:bg-sidebar-accent data-[state=checked]:text-sidebar-accent-foreground"
      />
      <Label
        htmlFor={label}
        className="text-sm font-normal cursor-pointer text-sidebar-foreground hover:text-sidebar-accent transition-colors"
      >
        {label}
      </Label>
    </div>
  );
};
