import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { parseISO, format, differenceInDays } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Reminder {
  id?: string;
  title: string;
  date: string;
}

export default function ReminderApp() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const reminderRef = collection(db, 'reminders');

  const fetchReminders = async () => {
    const data = await getDocs(reminderRef);
    setReminders(
      data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reminder[]
    );
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    const today = new Date();
    reminders.forEach((reminder) => {
      const dueDate = parseISO(reminder.date);
      const daysDiff = differenceInDays(dueDate, today);
      if (daysDiff === 3) {
        toast.info('Reminder due soon', {
          description: `"${reminder.title}" is due in 3 days!`,
        });
        playSound();
      }
    });
  }, [reminders]);

  const handleSubmit = async () => {
    if (!title.trim() || !date) {
      toast.error('Please enter title and date');
      return;
    }

    const reminder = { title: title.trim(), date };

    try {
      if (editingId) {
        const docRef = doc(db, 'reminders', editingId);
        await updateDoc(docRef, reminder);
        setEditingId(null);
      } else {
        await addDoc(reminderRef, reminder);
      }
      setTitle('');
      setDate('');
      fetchReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Error saving reminder');
    }
  };

  const handleEdit = (r: Reminder) => {
    setTitle(r.title);
    setDate(r.date);
    setEditingId(r.id || null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, 'reminders', id));
    fetchReminders();
  };

  const playSound = () => {
    const audio = new Audio('/notify.mp3');
    audio.play().catch((e) => console.warn('Autoplay blocked', e));
  };

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      {/* Input Card */}
      <div className='rounded-2xl border bg-background/60 shadow-xl p-6 backdrop-blur-md'>
        <h2 className='text-2xl font-bold tracking-tight mb-6 text-foreground'>{editingId ? 'Edit Reminder' : 'Create a Reminder'}</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input id='title' placeholder='e.g. Finish client report' value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='date'>Due Date</Label>
            <Input id='date' type='date' value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleSubmit} className='w-full bg-primary hover:bg-primary/90 transition-colors shadow-md mt-8'>
          {editingId ? 'Update Reminder' : 'Add Reminder'}
        </Button>
      </div>

      {/* Reminder Cards */}
      <div className='grid gap-6'>
        {reminders.length === 0 && <p className='text-muted-foreground text-center text-sm'>No reminders yet.</p>}

        {reminders.map((r, index) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className='border hover:shadow-xl transition-shadow'>
              <CardContent>
                <h3 className='text-lg font-semibold'>{r.title}</h3>
                <p className='text-sm text-muted-foreground'>Due: {format(parseISO(r.date), 'PPP')}</p>
              </CardContent>
              <CardFooter className='flex gap-2 justify-end'>
                <Button variant='outline' size='sm' className='hover:border-primary text-primary transition' onClick={() => handleEdit(r)}>
                  Edit
                </Button>

                <Button variant='destructive' size='sm' className='hover:bg-red-600 transition' onClick={() => handleDelete(r.id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
