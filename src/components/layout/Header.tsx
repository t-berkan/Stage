import { useEffect, useState } from "react";
import { Bell, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, GlobalNotification } from "@/lib/studiesData";

export function Header() {
  const [userName, setUserName] = useState("Étudiant");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);

  useEffect(() => {
    const loadUserData = () => {
      const storedId = localStorage.getItem("userId") || "";
      setUserId(storedId);

      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
      const storedAvatar = localStorage.getItem("userAvatar");
      if (storedAvatar) {
        setUserAvatar(storedAvatar);
      }

      if (storedId) {
        setNotifications(getNotifications(storedId));
      }
    };

    // Load initial data
    loadUserData();

    const handleNotificationsUpdate = () => {
      const currentId = localStorage.getItem("userId") || "";
      if (currentId) {
        setNotifications(getNotifications(currentId));
      }
    };

    // Listen for custom events
    window.addEventListener("avatarUpdated", loadUserData);
    window.addEventListener("profileUpdated", loadUserData);
    window.addEventListener("notificationsUpdated", handleNotificationsUpdate);
    window.addEventListener("storage", handleNotificationsUpdate);

    return () => {
      window.removeEventListener("avatarUpdated", loadUserData);
      window.removeEventListener("profileUpdated", loadUserData);
      window.removeEventListener("notificationsUpdated", handleNotificationsUpdate);
      window.removeEventListener("storage", handleNotificationsUpdate);
    };
  }, []);

  const handleMarkAsRead = (id: string) => {
    if (userId) {
      markNotificationAsRead(userId, id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (userId) {
      markAllNotificationsAsRead(userId);
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <header className="flex items-center justify-between py-5 pl-2 md:pl-6 lg:pl-10 pr-2 md:pr-0 bg-transparent">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12 border-[3px] border-white dark:border-navy shadow-sm bg-gray-100 dark:bg-gray-800">
          {userAvatar ? (
            <AvatarImage src={userAvatar} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-pink text-pink-foreground">
            {userName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500 leading-none mb-0.5">Hi</span>
          <span className="text-xl font-bold text-navy leading-none">{userName} !</span>
        </div>
      </div>

      <div className="flex items-center gap-3 -mr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all relative group text-gray-400 hover:text-navy cursor-pointer outline-none">
              <Bell className="w-6 h-6" />
              {hasUnread && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-pink rounded-full border border-white"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border-gray-100 shadow-lg mt-2">
            <DropdownMenuLabel className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 font-semibold text-navy">
              Notifications
            </DropdownMenuLabel>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Aucune notification
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="last:border-0 border-b border-gray-100" onClick={() => handleMarkAsRead(notification.id)}>
                    <DropdownMenuItem className={`px-4 py-3 flex flex-col items-start gap-1 cursor-pointer focus:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-[#f0f9ff]/50' : ''}`}>
                      <div className="flex items-start gap-2 w-full">
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          {notification.senderName && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-pink/80 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-pink"></span>
                              {notification.senderName} ({notification.senderRole})
                            </span>
                          )}
                          <span className={`text-sm ${!notification.isRead ? 'text-navy font-medium' : 'text-gray-600'}`}>
                            {notification.message}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 pl-4">{notification.time}</span>
                    </DropdownMenuItem>
                  </div>
                ))
              )}
            </div>
            <DropdownMenuSeparator className="m-0 bg-gray-100" />
            <div
              className="p-3 text-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer text-xs text-navy/70 font-semibold transition-colors active:bg-gray-100"
              onClick={handleMarkAllAsRead}
            >
              Marquer tout comme lu
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to="/settings" className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] text-navy transition-all hover:scale-105 active:scale-95">
          <Settings className="w-6 h-6 stroke-[2px]" />
        </Link>
      </div>
    </header>
  );
}