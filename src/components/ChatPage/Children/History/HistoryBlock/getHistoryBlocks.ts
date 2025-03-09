import { Chat } from "~/lib/typesJsonData";

const MONTHS: { [key: string]: string } & { [key: number]: string } = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const categorizeDate = (createdAt: string): string => {
  const date = new Date(createdAt);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else if (
    date.getMonth() === currentMonth &&
    date.getFullYear() === currentYear
  ) {
    return "Previous 30 days";
  } else if (date.getFullYear() === currentYear) {
    return MONTHS[date.getMonth() + 1];
  } else {
    return date.getFullYear().toString();
  }
};

export function getHistoryBlocks(entries: Chat[]) {
  const blocks = entries.reduce((acc, entry) => {
    const category = categorizeDate(entry.createdAt);
    if (!acc.has(category)) {
      acc.set(category, []);
    }
    acc.get(category)!.push(entry);
    return acc;
  }, new Map<string, Chat[]>());

  return Array.from(blocks.entries());
}
