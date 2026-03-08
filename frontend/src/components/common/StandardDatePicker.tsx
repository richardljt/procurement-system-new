import React from 'react';
import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { cn } from '../../lib/utils';

const commonTimeConfig = (showTime: boolean | object | undefined) => {
  if (!showTime) return false;
  const baseConfig = { minuteStep: 30, format: 'HH:mm' };
  return typeof showTime === 'object' ? { ...baseConfig, ...showTime } : baseConfig;
};

const datePickerBaseClasses =
  'w-full bg-white border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';

/**
 * A standardized DatePicker component that uses Tailwind CSS for styling
 * and enforces 30-minute steps for time selection.
 */
export const StandardDatePicker: React.FC<DatePickerProps> = ({ className, ...props }) => {
  const showTimeConfig = commonTimeConfig(props.showTime);

  return (
    <DatePicker
      {...props}
      showTime={showTimeConfig as any}
      className={cn(datePickerBaseClasses, className)}
    />
  );
};

/**
 * A standardized RangePicker component that uses Tailwind CSS for styling
 * and enforces 30-minute steps for time selection.
 */
export const StandardRangePicker: React.FC<RangePickerProps> = ({ className, ...props }) => {
  const showTimeConfig = commonTimeConfig(props.showTime);

  return (
    <DatePicker.RangePicker
      {...props}
      showTime={showTimeConfig as any}
      className={cn(datePickerBaseClasses, className)}
    />
  );
};
