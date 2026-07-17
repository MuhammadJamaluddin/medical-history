# Medical History

A personal medical-memory tool (not an EHR or clinician system of record). One Account holds multiple Personas (self, mother, child, …); Events always belong to one Persona and are visible only to that Account.

## Language

**Account**:
The single set of credentials that signs in. Owns one or more Personas. Does not itself have a medical history.
_Avoid_: User (ambiguous), profile

**Persona**:
A named person under an Account whose medical history is recorded (self, mother, child, or another). Events always belong to one Persona. v1: all Personas under an Account are fully accessible with that Account’s credentials — no separate invitations, roles, or care relationships. Deleting a Persona permanently deletes all of its Events.
_Avoid_: Subject, profile, dependent, patient record (overloaded)

**Self Persona**:
The required Persona created with the Account for the Account holder’s own history. The default Timeline target. Additional Personas may be added; the Self Persona cannot be removed while the Account exists.
_Avoid_: Primary profile, main user

**Patient**:
The clinical person a Persona represents — the human whose care the Events describe. Same person as the Persona; used when emphasizing health, not the Account switcher.
_Avoid_: User, client, member

**Event**:
A discrete occurrence in exactly one Persona’s medical history (never shared across Personas). In v1 it is freeform: a title, an **occurred-on** date (primary for timeline order — when the care happened or the fact became true), a body of text, optional Tags, zero or more Attachments, and a **recorded-at** timestamp (when the Account saved it; audit only). Not rigid clinical schemas or continuous vitals streams. The Account may permanently delete an Event.
_Avoid_: Entry, note, record, log item, chart entry

**Attachment**:
A file (PDF, image, or other) stored on an Event as part of that Event’s history for a Persona. Belongs to the Event; deleting the Event removes its Attachments.
_Avoid_: Document, media, upload (implementation-flavored)

**Timeline**:
The ordered view of a single Persona’s Events by occurred-on (not by recorded-at). The primary way history is browsed.
_Avoid_: Feed, activity log, chart

**Tag**:
An Account-defined label applied to Events for filtering and grouping on a Persona’s Timeline (e.g. cardiology, medications). Not a fixed clinical coding system.
_Avoid_: Category, type, code, diagnosis code
