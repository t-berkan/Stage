import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Search, ChevronDown, Download, MessageSquare, Phone, Mail, Clock, CheckCircle2, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getTickets, createTicket, updateTicketStatus, removeTicket, type Ticket } from "@/lib/ticketsData";

// --- MOCK DATA ---
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Contact {
  id: string;
  service: string;
  email: string;
  phone: string;
}

const initialFaqs: FaqItem[] = [
  { id: "1", category: "Général", question: "Comment me connecter au Wi-Fi Eduroam ?", answer: "Utilisez vos identifiants RSB complets (prenom.nom@rsb.edu) et le mot de passe de votre compte école." },
  { id: "2", category: "Scolarité", question: "Que faire en cas d'absence à un examen ?", answer: "Vous devez fournir un justificatif médical (ou équivalent) à la scolarité dans les 48h suivant l'absence." },
  { id: "3", category: "Informatique", question: "J'ai oublié le mot de passe de mon espace étudiant.", answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion, ou contactez le support IT." },
];

const initialContacts: Contact[] = [
  { id: "1", service: "Support Informatique (IT)", email: "it.support@rsb.edu", phone: "+33 2 99 54 63 66" },
  { id: "2", service: "Scolarité / Planning", email: "scolarite@rsb.edu", phone: "+33 2 99 54 63 60" },
  { id: "3", service: "Relations Internationales", email: "exchange@rsb.edu", phone: "+33 2 99 54 63 75" },
];

const Help = () => {
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "admin";

  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [tickets, setTickets] = useState<Ticket[]>([]); // Initialize empty, fill in useEffect
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  useEffect(() => {
    const loadTickets = () => {
      setTickets(getTickets());
    };

    loadTickets();

    window.addEventListener("tickets-updated", loadTickets);
    return () => window.removeEventListener("tickets-updated", loadTickets);
  }, []);

  // Admin specific state
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm, setFaqForm] = useState<Partial<FaqItem>>({});

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState<Partial<Contact>>({});

  const handleOpenFaqModal = (faq?: FaqItem) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm(faq);
    } else {
      setEditingFaq(null);
      setFaqForm({ question: "", answer: "", category: "Scolarité" });
    }
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = () => {
    if (!faqForm.question || !faqForm.answer) return;
    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === editingFaq.id ? { ...f, ...faqForm } as FaqItem : f));
    } else {
      setFaqs([...faqs, { ...faqForm, id: Math.random().toString() } as FaqItem]);
    }
    setIsFaqModalOpen(false);
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm("Supprimer cette question de la FAQ ?")) {
      setFaqs(faqs.filter(f => f.id !== id));
    }
  };

  const handleOpenContactModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm(contact);
    } else {
      setEditingContact(null);
      setContactForm({ service: "", email: "", phone: "" });
    }
    setIsContactModalOpen(true);
  };

  const handleSaveContact = () => {
    if (!contactForm.service || !contactForm.email) return;
    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...contactForm } as Contact : c));
    } else {
      setContacts([...contacts, { ...contactForm, id: Math.random().toString() } as Contact]);
    }
    setIsContactModalOpen(false);
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm("Supprimer ce contact ?")) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  // Student specific state
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "", message: "" });

  const handleStudentSubmit = () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.message) {
      toast.error("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    createTicket({
      subject: ticketForm.subject,
      category: ticketForm.category,
      message: ticketForm.message
    });

    toast.success("Votre demande a bien été envoyée au support.");
    setTicketForm({ subject: "", category: "", message: "" });
  };

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="pb-8 animate-fade-in pr-2 custom-scrollbar overflow-y-auto h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-navy">
            {isAdmin ? "Centre de Support - Administration" : "Aide & Support"}
          </h1>
        </div>

        {isAdmin ? (
          <div className="space-y-12 pb-12">
            {/* ADMIN VIEW */}
            {/* Section 1: Ticket Manager */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Gestionnaire de Tickets</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                        <TableHead className="font-semibold text-navy">ID</TableHead>
                        <TableHead className="font-semibold text-navy">Date</TableHead>
                        <TableHead className="font-semibold text-navy">Étudiant</TableHead>
                        <TableHead className="font-semibold text-navy">Catégorie & Sujet</TableHead>
                        <TableHead className="font-semibold text-navy">Statut</TableHead>
                        <TableHead className="text-right font-semibold text-navy">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-navy">
                            <Badge variant="outline" className="text-xs bg-gray-50">{ticket.id}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-500 whitespace-nowrap">{ticket.date}</TableCell>
                          <TableCell className="font-medium text-gray-700">{ticket.studentName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-navy">{ticket.subject}</span>
                              <span className="text-xs text-gray-400">{ticket.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${ticket.status === 'new' ? 'bg-amber-100 text-amber-700 border-none' :
                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-none' :
                                  'bg-green-100 text-green-700 border-none'
                                }`}
                            >
                              {ticket.status === 'new' ? 'Nouveau' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={ticket.status}
                              onValueChange={(val: Ticket["status"]) => {
                                updateTicketStatus(ticket.id, val);
                                toast.success(`Statut du ticket ${ticket.id} mis à jour.`);
                              }}
                            >
                              <SelectTrigger className="w-[140px] h-8 ml-auto text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new" className="text-xs">Mettre Nouveau</SelectItem>
                                <SelectItem value="in_progress" className="text-xs">Mettre En cours</SelectItem>
                                <SelectItem value="resolved" className="text-xs">Marquer Résolu</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>
            {/* Section 2: FAQ Editor */}
            <section>
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <h2 className="text-xl font-semibold text-navy">Éditeur de FAQ</h2>
                <Button onClick={() => handleOpenFaqModal()} size="sm" className="bg-navy hover:bg-navy-light text-white h-8 text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une question
                </Button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                      <TableHead className="font-semibold text-navy">Question / Réponse</TableHead>
                      <TableHead className="font-semibold text-navy w-[150px]">Catégorie</TableHead>
                      <TableHead className="text-right font-semibold text-navy w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <p className="font-medium text-navy text-sm">{faq.question}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{faq.answer}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-gray-50">{faq.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenFaqModal(faq)} className="h-7 w-7 text-gray-400 hover:text-navy hover:bg-gray-100">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteFaq(faq.id)} className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Section 3: Services Directory */}
            <section>
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <h2 className="text-xl font-semibold text-navy">Annuaire des Services</h2>
                <Button onClick={() => handleOpenContactModal()} size="sm" className="bg-navy hover:bg-navy-light text-white h-8 text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Ajouter un contact
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenContactModal(contact)} className="h-6 w-6 text-gray-400 hover:text-navy hover:bg-gray-100">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)} className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <h4 className="font-semibold text-navy text-sm mb-2 pr-12">{contact.service}</h4>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {contact.email}</div>
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {contact.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Admin Modals */}
            <Dialog open={isFaqModalOpen} onOpenChange={setIsFaqModalOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingFaq ? "Modifier la FAQ" : "Nouvelle question FAQ"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Catégorie</Label><Input value={faqForm.category || ""} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })} placeholder="Ex: Informatique" /></div>
                  <div className="space-y-2"><Label>Question</Label><Input value={faqForm.question || ""} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="La question posée..." /></div>
                  <div className="space-y-2"><Label>Réponse</Label><Textarea value={faqForm.answer || ""} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} placeholder="La réponse détaillée..." rows={4} /></div>
                </div>
                <DialogFooter><Button onClick={handleSaveFaq} className="bg-navy hover:bg-navy-light text-white">Enregistrer</Button></DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingContact ? "Modifier le contact" : "Nouveau contact"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Service concerné</Label><Input value={contactForm.service || ""} onChange={e => setContactForm({ ...contactForm, service: e.target.value })} placeholder="Ex: Scolarité Principale" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={contactForm.email || ""} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="contact@rsb.edu" /></div>
                  <div className="space-y-2"><Label>Téléphone</Label><Input value={contactForm.phone || ""} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="+33 2..." /></div>
                </div>
                <DialogFooter><Button onClick={handleSaveContact} className="bg-navy hover:bg-navy-light text-white">Enregistrer</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-12 pb-12">
            {/* STUDENT VIEW */}
            {/* Section 1 & 2: FAQ and Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Foire Aux Questions (FAQ)</h2>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Rechercher une réponse (ex: mot de passe...)"
                      className="pl-10 mr-4 h-12 bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {filteredFaqs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFaqs.map((faq) => (
                          <AccordionItem key={`faq-${faq.id}`} value={`faq-${faq.id}`} className="border-b last:border-0 border-gray-100 px-6">
                            <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold text-navy">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 text-gray-600 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                        <MessageSquare className="w-12 h-12 mb-3 text-gray-200" />
                        <p>Aucune réponse trouvée pour "{searchQuery}".</p>
                        <p className="text-sm mt-1">N'hésitez pas à créer un ticket pour contacter le support.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Guide d'Utilisation</h2>
                  <div className="bg-pink-light/30 border border-pink/20 rounded-xl p-6 text-center shadow-sm">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-pink" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">Tutoriel Plateforme</h3>
                    <p className="text-sm text-gray-600 mb-6">Un guide complet PDF et vidéo pour prendre en main votre espace étudiant.</p>
                    <Button className="w-full bg-pink hover:bg-pink-light text-white font-semibold shadow-md">
                      Télécharger le guide
                    </Button>
                  </div>
                </section>
              </div>
            </div>

            {/* Section 3 & 4: Tickets and Emergency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Créer un Ticket (Demande d'aide)</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-navy font-semibold">Sujet de la demande</Label>
                    <Input
                      id="subject"
                      placeholder="Ex: Problème d'absence non justifiée..."
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy font-semibold">Catégorie</Label>
                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scolarité">Scolarité / Emploi du temps</SelectItem>
                        <SelectItem value="Informatique">Support Informatique (IT)</SelectItem>
                        <SelectItem value="Administratif">Administratif / Inscription</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-navy font-semibold">Description détaillée</Label>
                    <Textarea
                      id="message"
                      placeholder="Expliquez votre problème en détail..."
                      rows={4}
                      className="resize-none"
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleStudentSubmit} className="w-full bg-navy hover:bg-navy-light text-white font-semibold">
                    Envoyer ma demande
                  </Button>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Mes demandes en cours</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {tickets.filter(t => t.studentName === (localStorage.getItem("userName") || "Étudiant")).length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {tickets
                        .filter(t => t.studentName === (localStorage.getItem("userName") || "Étudiant"))
                        .map((ticket) => (
                          <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-navy">{ticket.subject}</span>
                                <Badge variant="outline" className="text-[10px] h-4 bg-gray-50">{ticket.id}</Badge>
                              </div>
                              <span className="text-xs text-gray-400">{ticket.category} • {ticket.date}</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0 h-5 border-none ${ticket.status === 'new' ? 'bg-amber-100 text-amber-700' :
                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}
                            >
                              {ticket.status === 'new' ? 'Nouveau' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <p className="text-sm italic">Vous n'avez aucune demande en cours.</p>
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Section 4: Emergency Contacts (Full Width) */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Contacts d'Urgence</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-pink/50 transition-colors group">
                    <h4 className="font-semibold text-navy mb-3 text-sm">{contact.service}</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-pink transition-colors">
                        <Mail className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                      <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:text-pink transition-colors">
                        <Phone className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink shrink-0" />
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                ))}

                {/* Additional hardcoded item for aesthetic balance if needed */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 border-dashed p-4 flex flex-col items-center justify-center text-center h-full min-h-[120px]">
                  <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Urgences Générales</p>
                  <p className="text-xs text-gray-500 mt-1">Appelez le 112</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Help;