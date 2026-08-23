export type Clock = () => Date;
export type MadridDateBoundary = Readonly<{ today: string; tomorrow: string }>;
export type GoalDateError = "invalid_date" | "not_future";

const MADRID_FORMATTER = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Europe/Madrid",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

function parseDate(value: string): { year: number; month: number; day: number } | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const [year, month, day] = value.split("-").map(Number);
	if (year < 1 || year > 9999 || month < 1 || month > 12) return null;
	const daysInMonth = month === 2
		? (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28)
		: [4, 6, 9, 11].includes(month) ? 30 : 31;
	return day >= 1 && day <= daysInMonth ? { year, month, day } : null;
}

function canonicalDate({ year, month, day }: { year: number; month: number; day: number }): string {
	return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nextDate(value: string): string {
	const date = parseDate(value);
	if (!date) throw new Error("Madrid date boundary must be canonical");
	const daysInMonth = date.month === 2
		? (date.year % 4 === 0 && (date.year % 100 !== 0 || date.year % 400 === 0) ? 29 : 28)
		: [4, 6, 9, 11].includes(date.month) ? 30 : 31;
	if (date.day < daysInMonth) return canonicalDate({ ...date, day: date.day + 1 });
	if (date.month < 12) return canonicalDate({ year: date.year, month: date.month + 1, day: 1 });
	return canonicalDate({ year: date.year + 1, month: 1, day: 1 });
}

export function madridDateBoundary(clock: Clock = () => new Date()): MadridDateBoundary {
	const parts = MADRID_FORMATTER.formatToParts(clock());
	const byType = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
	const today = `${byType.year}-${byType.month}-${byType.day}`;
	return { today, tomorrow: nextDate(today) };
}

export function validateGoalTargetDate(value: string, madridToday: string): GoalDateError | null {
	return parseDate(value) === null ? "invalid_date" : value <= madridToday ? "not_future" : null;
}
