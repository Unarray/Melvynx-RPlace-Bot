import { DayJS } from "#/utils/dayjs";
import { effect, effectReset, forground } from "tintify";

export const logger = {
  info: (message: string) => {
    console.log(formatLog(forground.blue, "info", message));
  },

  success: (message: string) => {
    console.log(formatLog(forground.green, "success", message));
  },

  error: (message: string) => {
    console.log(formatLog(forground.red, "error", message));
  }
};

export const formatLog = (color: typeof forground[keyof typeof forground], type: string, message: string): string => {
  const maxSpace = 8;
  const spaceSize = maxSpace - type.length;

  const datetime = DayJS().format("YYYY-MM-DD HH:mm:ss");

  const prefix = `${forground.white}[${datetime}] ${effect.bold}${color}${type.toUpperCase()}`;
  const separator = `${effectReset.all} ${forground.black}${"-".repeat(spaceSize)}» `;
  const content = `${effectReset.all}${message}`;

  return `${prefix}${separator}${content}`;
};