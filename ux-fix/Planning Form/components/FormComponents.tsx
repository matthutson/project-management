import { useState } from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { cn } from "./ui/utils";

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={cn("mb-12", className)}>
      {title && <h2 className="text-3xl font-bold mb-6">{title}</h2>}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function FormField({ label, children, required, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-bold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {children}
    </div>
  );
}

type FormTextFieldProps = {
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FormTextField({ 
  label, 
  description, 
  placeholder, 
  required, 
  value, 
  onChange,
  className 
}: FormTextFieldProps) {
  return (
    <FormField label={label} required={required} className={className}>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      <Input 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </FormField>
  );
}

type FormTextAreaProps = {
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FormTextArea({ 
  label, 
  description, 
  placeholder, 
  required, 
  value, 
  onChange,
  className 
}: FormTextAreaProps) {
  return (
    <FormField label={label} required={required} className={className}>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      <Textarea 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={cn("min-h-[100px]", className)}
      />
    </FormField>
  );
}

type FormDatePickerProps = {
  label: string;
  description?: string;
  required?: boolean;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  className?: string;
};

export function FormDatePicker({
  label,
  description,
  required,
  value,
  onChange,
  className,
}: FormDatePickerProps) {
  return (
    <FormField label={label} required={required} className={className}>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full bg-white",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Select a date</span>}
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormField>
  );
}

type FormSelectProps = {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FormSelect({ 
  label, 
  description, 
  options, 
  required, 
  value, 
  onChange,
  className 
}: FormSelectProps) {
  return (
    <FormField label={label} required={required} className={className}>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-gray-50 h-11">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

type FormCheckboxProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  children?: React.ReactNode;
  isAccordion?: boolean;
};

export function FormCheckbox({ 
  label, 
  description, 
  checked, 
  onChange,
  className,
  children,
  isAccordion = false
}: FormCheckboxProps) {
  const handleChange = (checked: boolean) => {
    onChange(checked);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn(
        "flex items-center space-x-2 p-3 rounded-md",
        isAccordion && "bg-gray-50 hover:bg-gray-100 transition-colors"
      )}>
        <Checkbox 
          id={`checkbox-${label}`}
          checked={checked} 
          onCheckedChange={handleChange}
        />
        <Label htmlFor={`checkbox-${label}`} className="font-medium cursor-pointer flex-grow">
          {label}
        </Label>
        {isAccordion && children && (
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              checked ? "transform rotate-180" : ""
            )}
          />
        )}
      </div>
      {description && <p className="text-sm text-gray-500 pl-6">{description}</p>}
      {children && checked && (
        <div className={cn(
          "border-2 border-gray-300 rounded-md p-6 mt-4 bg-white animate-in fade-in-50 duration-300",
          isAccordion ? "border-gray-300" : "border-l-2 border-r-0 border-t-0 border-b-0 pl-6 ml-3 mt-2 rounded-none p-0"
        )}>
          {children}
        </div>
      )}
    </div>
  );
}

type FormRadioGroupProps = {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isYesNo?: boolean;
};

export function FormRadioGroup({
  label,
  description,
  options,
  value,
  onChange,
  className,
  isYesNo = false,
}: FormRadioGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-bold">{label}</Label>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      
      {isYesNo ? (
        // Enhanced Yes/No UI
        <div className="grid grid-cols-2 gap-3 mt-2">
          {options.map((option) => (
            <div 
              key={option.value} 
              className={cn(
                "border rounded-md py-3 px-4 cursor-pointer flex items-center justify-center relative transition-all",
                value === option.value 
                  ? "border-black bg-gray-100" 
                  : "border-gray-300 bg-white hover:bg-gray-50"
              )}
              onClick={() => onChange(option.value)}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border border-black">
                {value === option.value && (
                  <div className="h-2.5 w-2.5 rounded-full bg-black" />
                )}
              </div>
              <span className="font-medium">{option.label}</span>
            </div>
          ))}
        </div>
      ) : (
        // Standard radio group
        <RadioGroup 
          value={value} 
          onValueChange={onChange} 
          className="space-y-2 bg-gray-50 p-3 rounded-md"
        >
          {options.map((option) => (
            <div className="flex items-center space-x-2" key={option.value}>
              <RadioGroupItem value={option.value} id={`radio-${option.value}`} />
              <Label htmlFor={`radio-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}

type ConditionalSectionProps = {
  showWhen: boolean;
  children: React.ReactNode;
};

export function ConditionalSection({ showWhen, children }: ConditionalSectionProps) {
  return showWhen ? (
    <div className="mt-4 border-2 border-gray-300 rounded-md p-6 bg-white animate-in fade-in-50 duration-300 slide-in-from-top-5">
      {children}
    </div>
  ) : null;
}

type AccordionSectionProps = {
  title: string;
  value: string;
  open: boolean;
  children: React.ReactNode;
};

export function AccordionSection({ title, value, open, children }: AccordionSectionProps) {
  return (
    <Accordion 
      type="single" 
      collapsible 
      defaultValue={open ? value : undefined} 
      className="w-full bg-gray-50 rounded-md border border-gray-200"
    >
      <AccordionItem value={value} className="border-b-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-gray-100 rounded-t-md">
          {title}
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 border-t border-gray-200 mt-1">
          <div className="pt-4 animate-in fade-in-50 duration-200">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

type CheckboxGroupProps = {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: number;
  className?: string;
};

export function CheckboxGroup({ 
  options, 
  selected, 
  onChange,
  columns = 1,
  className 
}: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Create proper grid column class based on number of columns
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns as 1 | 2 | 3 | 4] || "grid-cols-1";

  return (
    <div className={cn(`grid ${gridClass} gap-3 bg-gray-50 p-4 rounded-md`, className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`checkbox-group-${option.value}`}
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label htmlFor={`checkbox-group-${option.value}`} className="font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}