import express from 'express';
import { events } from '../data/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Middleware to protect all routes
router.use(authMiddleware);

// Fixed: Filter events by user permissions
router.get('/', (req, res) => {
    const userEvents = events.filter(event =>
        event.creatorId === req.user.id ||
        event.invitedEmails.includes(req.user.email)
    );
    res.json(userEvents);
});

router.post('/', (req, res) => {
    const { title, description, date, invitedEmails } = req.body;
    const newEvent = {
        id: Date.now().toString(),
        title,
        description,
        date,
        creatorId: req.user.id,
        invitedEmails: invitedEmails || [],
        rsvps: []
    };
    events.push(newEvent);
    console.log(`Invitations sent for event "${title}" to: ${newEvent.invitedEmails.join(', ')}`);
    res.status(201).json(newEvent);
});

// Fixed: Check permissions before returning event details
router.get('/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if user is creator or is invited
    const isCreator = event.creatorId === req.user.id;
    const isInvited = event.invitedEmails.includes(req.user.email);

    if (!isCreator && !isInvited) {
        return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
        ...event,
        isCreator,
        isInvited
    });
});

// Fixed: Check invitation and prevent duplicate RSVPs
router.post('/:id/rsvp', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if user is invited (creators can RSVP to their own events)
    const isCreator = event.creatorId === req.user.id;
    const isInvited = event.invitedEmails.includes(req.user.email);

    if (!isCreator && !isInvited) {
        return res.status(403).json({ message: 'You are not invited to this event' });
    }

    // Check for duplicate RSVP
    if (event.rsvps.includes(req.user.id)) {
        return res.status(400).json({ message: 'You have already RSVPed to this event' });
    }

    event.rsvps.push(req.user.id);
    res.json({ message: 'RSVP successful', event });
});

// Fixed: Only allow event creators to delete their events
router.delete('/:id', (req, res) => {
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    if (eventIndex === -1) return res.status(404).json({ message: 'Event not found' });

    const event = events[eventIndex];

    // Check if user is the creator
    if (event.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Only event creators can delete events' });
    }

    events.splice(eventIndex, 1);
    res.json({ message: 'Event deleted' });
});

export default router;
