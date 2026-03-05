import { useState, useEffect } from "react";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";
import { getItems, addItem, updateItem, removeItem, type EventNewsItem } from "@/lib/eventsData";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EventsSection() {
  const [activeTab, setActiveTab] = useState<"events" | "news">("events");
  const [items, setItems] = useState<EventNewsItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [newItem, setNewItem] = useState({
    title: "",
    subtitle: "",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
    type: "events" as "events" | "news",
    variant: "primary" as "primary" | "secondary" | "tertiary",
  });

  useEffect(() => {
    const loadItems = () => {
      setItems(getItems());
    };

    loadItems();
    setIsAdmin(localStorage.getItem("userRole") === "admin");

    window.addEventListener("events-updated", loadItems);
    return () => window.removeEventListener("events-updated", loadItems);
  }, []);

  const filteredItems = items.filter((item) => item.type === activeTab);

  const handleEditClick = (item: EventNewsItem) => {
    setEditingId(item.id);
    setNewItem({
      title: item.title,
      subtitle: item.subtitle || "",
      image: item.image,
      type: item.type,
      variant: item.variant,
    });
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!newItem.title) return;

    if (editingId) {
      updateItem(editingId, newItem);
    } else {
      addItem(newItem);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setNewItem({
      title: "",
      subtitle: "",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
      type: "events" as "events" | "news",
      variant: "primary" as "primary" | "secondary" | "tertiary",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b border-gray-100/80 pb-0">
        <div className="flex items-center gap-10">
          <button
            onClick={() => setActiveTab("events")}
            className={cn(
              "text-xl font-bold transition-all relative pb-2 px-1",
              activeTab === "events"
                ? "text-navy after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-navy after:rounded-t-lg"
                : "text-gray-400 hover:text-navy/70"
            )}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={cn(
              "text-xl font-bold transition-all relative pb-2 px-1",
              activeTab === "news"
                ? "text-navy after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-navy after:rounded-t-lg"
                : "text-gray-400 hover:text-navy/70"
            )}
          >
            News
          </button>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-navy hover:bg-navy/5"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
          <button
            onClick={() => setIsSeeAllModalOpen(true)}
            className="text-sm font-semibold text-[#0EA5E9] hover:text-[#0284C7] transition-colors mb-2"
          >
            See All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.slice(0, 3).map((item) => (
            <EventCard
              key={item.id}
              {...item}
              onDelete={isAdmin ? () => removeItem(item.id) : undefined}
              onEdit={isAdmin ? () => handleEditClick(item) : undefined}
            />
          ))
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 font-medium italic">Aucun élément trouvé.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier" : "Ajouter"} {newItem.type === "events" ? "l'événement" : "l'actualité"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Ex: Titre de l'actualité"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Sous-titre (Optionnel)</Label>
              <Input
                id="subtitle"
                value={newItem.subtitle}
                onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })}
                placeholder="Ex: RETOUR SUR"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">URL de l'image (Unsplash recommande)</Label>
              <Input
                id="image"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={newItem.type}
                  onValueChange={(val: "events" | "news") => setNewItem({ ...newItem, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="events">Événement</SelectItem>
                    <SelectItem value="news">Actualité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Style</Label>
                <Select
                  value={newItem.variant}
                  onValueChange={(val: "primary" | "secondary" | "tertiary") => setNewItem({ ...newItem, variant: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Bleu Marine</SelectItem>
                    <SelectItem value="secondary">Noir Vert</SelectItem>
                    <SelectItem value="tertiary">Dégradé Teal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} className="bg-navy">
              {editingId ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* See All Items Modal */}
      <Dialog open={isSeeAllModalOpen} onOpenChange={setIsSeeAllModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-6 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-navy flex items-center justify-between">
              <span>Tous les {activeTab === "events" ? "Événements" : "Actualités"}</span>
              <span className="text-sm font-normal text-gray-500 mr-8">{filteredItems.length} élément{filteredItems.length !== 1 ? 's' : ''}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 py-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.id} className="relative">
                  <EventCard
                    {...item}
                    onDelete={isAdmin ? () => removeItem(item.id) : undefined}
                    onEdit={isAdmin ? () => handleEditClick(item) : undefined}
                  />
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl w-full">
                <p className="text-gray-400 font-medium italic">Aucun élément trouvé.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsSeeAllModalOpen(false)} variant="outline" className="rounded-xl px-8 border-gray-200 text-navy hover:bg-gray-50">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}