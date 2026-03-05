export interface Ticket {
    id: string;
    studentName: string;
    studentEmail: string;
    subject: string;
    category: string;
    message: string;
    date: string;
    status: "new" | "in_progress" | "resolved";
    createdAt: string;
}

const STORAGE_KEY = "rsb_tickets";

export function getTickets(): Ticket[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
    }
    const tickets: Ticket[] = JSON.parse(saved);
    // Cleanup: Filter out the specific mock tickets if they still exist
    const filtered = tickets.filter(t => t.id !== "T-1042" && t.id !== "T-1041" && t.studentName !== "Lucas Martin" && t.studentName !== "Emma Bernard");
    if (filtered.length !== tickets.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
    }
    return tickets;
}

export function createTicket(data: Omit<Ticket, "id" | "date" | "status" | "createdAt" | "studentName" | "studentEmail">): Ticket {
    const tickets = getTickets();
    const userName = localStorage.getItem("userName") || "Étudiant";
    const userEmail = localStorage.getItem("userEmail") || "";

    const newTicket: Ticket = {
        ...data,
        id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: userName,
        studentEmail: userEmail,
        date: new Date().toISOString().split('T')[0],
        status: "new",
        createdAt: new Date().toISOString()
    };

    const updated = [newTicket, ...tickets];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent("tickets-updated"));

    return newTicket;
}

export function updateTicketStatus(id: string, status: Ticket["status"]): void {
    const tickets = getTickets();
    const updated = tickets.map((t) =>
        t.id === id ? { ...t, status } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent("tickets-updated"));
}

export function removeTicket(id: string): void {
    const tickets = getTickets();
    const updated = tickets.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent("tickets-updated"));
}
