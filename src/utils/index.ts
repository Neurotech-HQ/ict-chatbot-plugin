import { API_REQUEST_TIMEOUT, MEDIA_UPLOAD_TIMEOUT } from "@/constants";
import phone from "phone";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const isProbablyJSON = (str: string): boolean => {
  if (typeof str !== "string") return false;

  const trimmed = str.trim();
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  );
};

const formatErrorMessage = (error: any): string => {
  let message = "";
  if (typeof error?.response?.data?.detail === "object") {
    message =
      error?.response?.data?.detail?.[0]?.msg ||
      error?.response?.data?.detail?.[0]?.type;
  } else {
    message =
      error?.response?.data?.message?.error?.message ||
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.response?.data ||
      error?.message;
  }
  if (message?.includes(API_REQUEST_TIMEOUT.toString())) {
    message = "Request took too long";
  }
  if (message?.includes(MEDIA_UPLOAD_TIMEOUT.toString())) {
    message = "Request took too long";
  }
  return message;
};

const markdownWrap = (str: string | any) => {
  if (typeof str === "string" && str) {
    return str
      ?.replace(/(?:\*)([^*]*)(?:\*)/gm, "<strong>$1</strong> ")
      ?.replace(/(?:_)([^_]*)(?:_)/gm, "<i>$1</i> ")
      ?.replace(/(?:~)([^~]*)(?:~)/gm, "<strike>$1</strike> ")
      ?.replace(/(?:```)([^```]*)(?:```)/gm, "<tt>$1</tt> ");
  } else {
    return str;
  }
};

const wrapUrl = (str: string) => {
  // 1) Simple email‐matching regex
  const email_pattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

  // 2) Simple URL‐matching regex
  const url_pattern =
    /(http(s)?:\/\/.)?(www\.)?[-A-Za-z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-A-Za-z0-9@:%_\+.~#?&//=]*)/g;

  const words = str.split(" ");
  const strArr: string[] = [];

  words.forEach((word) => {
    // Preserve any internal line breaks by splitting on “\n”
    const segments = word.split("\n");
    const newSegments: string[] = [];

    segments.forEach((segment) => {
      // 1) If it’s an email, wrap in mailto:
      if (email_pattern.test(segment)) {
        newSegments.push(
          `<a href="mailto:${segment}" class="duration-300 text-mariner-600 hover:text-mariner-400 border-mariner-600 hover:border-mariner-400 border-b pb-[0.1rem]">${segment}</a>`
        );
      } else {
        // 2) Try phone(segment) as‐is (new phone() returns an object)
        const result = phone(segment);
        let normalized: string | null = null;
        let isValidPhone = false;

        // phone() now returns a PhoneResult-like object:
        //   { isValid: boolean, phoneNumber: string, countryIso2, countryCode, …}
        if (result.isValid && result.phoneNumber) {
          normalized = result.phoneNumber;
          isValidPhone = true;
        }

        // 3) If that failed and segment is all digits of length 7–15, try "+" + segment
        if (!isValidPhone && /^\d{7,15}$/.test(segment)) {
          const plusVersion = "+" + segment;
          const secondTry = phone(plusVersion);

          if (secondTry.isValid && secondTry.phoneNumber) {
            normalized = secondTry.phoneNumber;
            isValidPhone = true;
          }
          // 4) If still not valid, but it is purely digits of length 7–15, force "tel:+digits"
          else {
            normalized = plusVersion; // assume international‐style
            isValidPhone = true;
          }
        }

        // 5) If we found a phone, wrap in tel:
        if (isValidPhone && normalized) {
          newSegments.push(
            `<a href="tel:${normalized}" class="duration-300 text-mariner-600 hover:text-mariner-400 border-mariner-600 hover:border-mariner-400 border-b pb-[0.1rem]">${segment}</a>`
          );
        }
        // 6) Else if it’s a URL, wrap as before
        else if (url_pattern.test(segment)) {
          const protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
          const href = protocol_pattern.test(segment)
            ? segment
            : "http://" + segment;

          newSegments.push(
            `<a href="${href}" target="_blank" class="duration-300 text-mariner-600 hover:text-mariner-400 border-mariner-600 hover:border-mariner-400 border-b pb-[0.1rem]">${segment}</a>`
          );
        }
        // 7) Otherwise, leave it as plain text
        else {
          newSegments.push(segment);
        }
      }

      // Clear regex state
      email_pattern.lastIndex = 0;
      url_pattern.lastIndex = 0;
    });

    // Re‐join any split‐by‐"\n" segments
    strArr.push(newSegments.join("\n"));
  });

  return strArr.join(" ");
};

const formatUTCDate = (dateString: string): string => {
  const date = dayjs.utc(dateString); // Let dayjs handle ISO or custom

  if (!date.isValid()) return "Invalid date";

  const timezoneOffsetMinutes = dayjs().utcOffset(); // local offset
  const adjustedDate = date.utcOffset(timezoneOffsetMinutes);

  return adjustedDate.format("hh:mm A");
};

export { isProbablyJSON, formatErrorMessage, wrapUrl, markdownWrap, formatUTCDate };
