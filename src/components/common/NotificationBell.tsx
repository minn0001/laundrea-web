import React, { useState } from 'react';
import { AppNotification } from '../../types';
import { Bell, Check, Clock, X, ExternalLink } from 'lucide-react';

interface NotificationBellProps {
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
  onMarkAllRead: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onNotificationClick,
  onMarkAllRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Baru saja';
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} mnt lalu`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} jam lalu`;
      const diffDay = Math.floor(diffHour / 24);
      return `${diffDay} hari lalu`;
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="btn-customer-notification-bell"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifikasi Pesanan"
        className="relative w-9 h-9 rounded-full border border-white/20 bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xs text-white"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            id="badge-unread-notifications-count"
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse border-2 border-[#254117]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Drawer / Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile & desktop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* Container: Bottom Sheet on mobile, Dropdown panel on sm+ */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 p-4 text-[#254117] animate-in slide-in-from-bottom sm:slide-in-from-top-2 duration-200 max-h-[85vh] sm:max-h-[500px] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#cd6184]" />
                <h3 className="font-bold text-sm text-[#254117]">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {unreadCount} baru
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-[11px] font-semibold text-[#cd6184] hover:underline cursor-pointer"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer sm:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 py-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-500">Belum ada notifikasi</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Update status timbangan & pembayaran pesanan Anda akan muncul di sini.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNotificationClick(n);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-2.5 ${
                      !n.read
                        ? 'bg-[#ffecf2]/60 hover:bg-[#ffecf2] border-l-3 border-[#cd6184]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs ${
                            !n.read ? 'font-black text-[#254117]' : 'font-bold text-gray-700'
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(n.createdAt)}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom info */}
            <div className="pt-2 border-t border-gray-100 text-center shrink-0">
              <span className="text-[10px] text-gray-400">
                Ketuk notifikasi untuk membuka rincian pesanan terkait
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
