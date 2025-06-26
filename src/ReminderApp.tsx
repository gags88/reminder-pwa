import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { parseISO, format, differenceInDays } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface Reminder {
  id?: string;
  title: string;
  date: string;
}

export default function ReminderApp() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
  });

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

  const onSubmit = async (data: ReminderFormData) => {
    try {
      if (editingId) {
        const docRef = doc(db, 'reminders', editingId);
        await updateDoc(docRef, data);
        setEditingId(null);
      } else {
        await addDoc(reminderRef, data);
      }
      reset();
      fetchReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Error saving reminder');
    }
  };

  const handleEdit = (r: Reminder) => {
    setValue('title', r.title);
    setValue('date', r.date);
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
      <div className='rounded-2xl border bg-background/60 shadow-xl p-6 backdrop-blur-md'>
        <h2 className='text-2xl font-bold tracking-tight mb-6 text-foreground'>{editingId ? 'Edit Reminder' : 'Create a Reminder'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input id='title' placeholder='e.g. Finish client report' {...register('title')} />
            {errors.title && <p className='text-sm text-red-500'>{errors.title.message}</p>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='date'>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn('w-full justify-start text-left font-normal', !watch('date') && 'text-muted-foreground')}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {watch('date') ? format(parseISO(watch('date')), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={watch('date') ? parseISO(watch('date')) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setValue('date', date.toISOString().split('T')[0]);
                    }
                  }}
                  captionLayout='dropdown'
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className='text-sm text-red-500'>{errors.date.message}</p>}
          </div>
          <div className='md:col-span-2'>
            <Button type='submit' className='w-full bg-primary hover:bg-primary/90 transition-colors shadow-md mt-4'>
              {editingId ? 'Update Reminder' : 'Add Reminder'}
            </Button>
          </div>
        </form>
      </div>

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
                <h3 className='text-lg font-semibold pt-8'>{r.title}</h3>
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
