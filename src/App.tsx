import './App.css';
import { ThemeProvider } from './components/theme-provider';
import ReminderApp from './ReminderApp';
import { Toaster } from '@/components/ui/sonner';
import ModeToggle from '@/components/ui/mode-toggle';
import { motion } from 'framer-motion';
import { InstallPrompt } from './components/install-prompt';
import { useEffect } from 'react';
import { messaging, onMessage, requestFirebaseNotificationPermission } from './firebase';
import { toast } from 'sonner';

function App() {
  useEffect(() => {
    requestFirebaseNotificationPermission();

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      toast(payload.notification?.title ?? 'Notification', {
        description: payload.notification?.body,
      });
    });
  }, []);

  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <Toaster />
      <div className='min-h-screen bg-gradient-to-br from-[#e9f1ff] to-[#d6e4ff] dark:from-[#0f172a] dark:to-[#1e293b] p-4 text-foreground transition-all'>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-3xl font-bold tracking-tight'>Reminder App</h1>
            <ModeToggle />
            <InstallPrompt />
          </div>
          <ReminderApp />
        </motion.div>
      </div>
    </ThemeProvider>
  );
}

export default App;
