export interface EventNewsItem {
    id: string;
    title: string;
    subtitle?: string;
    image: string;
    type: "events" | "news";
    variant: "primary" | "secondary" | "tertiary";
    createdAt: number;
}

const initialItems: EventNewsItem[] = [
    {
        id: "1",
        title: "JOURNÉE\nPORTES OUVERTES",
        image: "https://misterprepa.net/wp-content/uploads/2024/06/Rennes-School-of-Business-une-ecole-qui-monte.png",
        type: "events",
        variant: "primary",
        createdAt: Date.now() - 1000000,
    },
    {
        id: "2",
        title: "LE MARATHON VERT 2024",
        subtitle: "RETOUR SUR",
        image: "https://misterprepa.net/wp-content/uploads/2024/06/Rennes-School-of-Business-une-ecole-qui-monte.png",
        type: "events",
        variant: "secondary",
        createdAt: Date.now() - 2000000,
    },
    {
        id: "3",
        title: "JUNIOR COMEX: DES ÉTUDIANTS\nINTÈGRENT LE COMEX DE\nRENNES SCHOOL OF BUSINESS",
        image: "https://misterprepa.net/wp-content/uploads/2024/06/Rennes-School-of-Business-une-ecole-qui-monte.png",
        type: "events",
        variant: "tertiary",
        createdAt: Date.now() - 3000000,
    },
];

const STORAGE_KEY = "dashboard_events_news_v1";

export function getItems(): EventNewsItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
        return initialItems;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse events/news", e);
        return initialItems;
    }
}

export function addItem(item: Omit<EventNewsItem, "id" | "createdAt">): EventNewsItem {
    const items = getItems();
    const newItem: EventNewsItem = {
        ...item,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
    };
    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent("events-updated"));

    return newItem;
}

export function updateItem(id: string, updates: Partial<Omit<EventNewsItem, "id" | "createdAt">>): void {
    const items = getItems();
    const updated = items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent("events-updated"));
}

export function removeItem(id: string): void {
    const items = getItems();
    const updated = items.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent("events-updated"));
}
