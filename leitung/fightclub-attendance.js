// Attendance is an explicit, readable annotation in the existing event/date note.
const TAG='[NO-SHOW]';
export function readAttendanceNote(value){
 const raw=String(value??''),noShow=raw===TAG||raw.startsWith(TAG+' ');
 return {noShow,note:noShow?raw.slice(TAG.length).replace(/^ /,''):raw};
}
export function writeAttendanceNote(note,noShow){
 const value=noShow?TAG+(note?' '+note:''):String(note??'');
 if(value.length>500)throw Error('attendance_note_too_long');
 return value;
}
export const attendanceNoteLimit=noShow=>noShow?500-TAG.length-1:500;
