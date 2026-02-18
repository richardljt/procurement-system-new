import React from 'react';
import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';

/**
 * Standard DatePicker with unified styling and behavior.
 * Enforces 30-minute steps for time selection.
 */
export const StandardDatePicker: React.FC<DatePickerProps> = (props) => {
  // Configure showTime to enforce 30-minute steps if showTime is enabled
  const showTimeConfig = props.showTime 
    ? (typeof props.showTime === 'object' 
        ? { ...props.showTime, minuteStep: 30 } 
        : { minuteStep: 30, format: 'HH:mm' } as any)
    : props.showTime;

  return (
    <DatePicker
      {...props}
      showTime={showTimeConfig}
    />
  );
};

export const StandardRangePicker: React.FC<RangePickerProps> = (props) => {
    const showTimeConfig = props.showTime 
    ? (typeof props.showTime === 'object' 
        ? { ...props.showTime, minuteStep: 30 } 
        : { minuteStep: 30, format: 'HH:mm' } as any)
    : props.showTime;

  return (
    <DatePicker.RangePicker
      {...props}
      showTime={showTimeConfig}
    />
  );
};
