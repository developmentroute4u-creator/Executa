"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl border border-stone-200 bg-white p-4 text-stone-900 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-[14px] font-bold text-stone-900",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity border border-stone-200 rounded-md flex items-center justify-center text-stone-900"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-stone-400 rounded-md w-8 font-bold text-[11px] uppercase tracking-wider text-center flex-1",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 w-8",
        day: cn(
          "h-8 w-8 p-0 font-medium text-[13px] text-stone-900 rounded-md transition-colors",
          "hover:bg-stone-100 hover:text-stone-900",
          "focus:bg-stone-100 focus:text-stone-900"
        ),
        day_selected:
          "!opacity-100 !bg-[#E85239] !text-white hover:!bg-[#E85239] hover:!text-white focus:!bg-[#E85239] focus:!text-white font-black shadow-md",
        day_today: "bg-stone-50 text-stone-900",
        day_outside: "text-stone-300 opacity-50 aria-selected:!opacity-100",
        day_disabled: "text-stone-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-stone-100 aria-selected:text-stone-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  label?: string;
  error?: string;
}

export function DatePicker({ date, setDate, label, error }: DatePickerProps) {
  return (
    <div className="w-full flex flex-col">
      {label && (
        <label className="block text-[14px] font-medium text-stone-900 mb-1.5">
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full rounded border px-4 py-2.5 text-sm text-left transition-all duration-150 flex items-center justify-between",
              "focus:outline-none focus:ring-2 focus:ring-[#E85239]/20",
              !date 
                ? "text-stone-400 border-stone-200 bg-white hover:border-stone-300" 
                : "text-[#E85239] font-bold border-[#E85239] bg-[#E85239]/10",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
            )}
          >
            {date ? format(date, "PPP") : <span>Pick a date</span>}
            <CalendarIcon className={cn("mr-2 h-4 w-4", date ? "text-[#E85239]" : "opacity-50 text-stone-500")} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
