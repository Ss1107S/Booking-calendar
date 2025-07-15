Final project is to create booking calendar for a control panel, which must cover:
* adding multiple events in the same day (event must have - guest list, event name, location, description and a time range (e.g. 12:34PM to 14:00PM)
* must have a week view like in the picture with events listed in it (per day) in a similar fashion
* must have a datepicker which can have day selected, and depending on which day is selected, that day's week will be rendered in the week view

Optional part of the final project:
* Tags which can be any text can be added to events, when adding events, that what is used to input data for new event should appear like a simple input in which you can write some text and when you press enter it adds that as a badge/label above the input, store it on the server (in memory or/and drive) and locally in memory along with the rest of the event's data (I recommend you store all event's data in an object and keep all events in an array, which should be loaded from the server once page is opened, I'll explain how to load from the server next class.)
* Filters (under the datepicker positioned as in the image) for events in the week view, with the following groups: Guest names, Locations, Time ranges, and Event tags
* which are to make make unmatched events disappear from the week view and must be able to re-appear when filter is removed
