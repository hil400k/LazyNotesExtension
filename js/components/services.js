angular.module("app")

.service("AuthService", function ($firebaseAuth, firebaseUrl) {
        var ref = new Firebase(firebaseUrl);

        return $firebaseAuth(ref);
    })
.service("NotesService", function (AuthService, firebaseUrl, $firebaseArray) {
    var ns = {};

    ns.ncurrent = {};

    ns.getDefaultTag = function() {
        return JSON.parse(localStorage.getItem('settings')) ? JSON.parse(localStorage.getItem('settings')).defaultTag : null;
    }

    ns.defaultTag = ns.getDefaultTag();

    ns.initNote = function () {
        ns.ncurrent = {
            dateOfCreation: null,
            text: '',
            tags: ns.defaultTag ? [ns.defaultTag] : '', // user default tag
            priority: 1,
            dateOfEditing: null,
            editingsCount: 0,
            sourceUrl: null
        };

        return ns.ncurrent;
    };

    ns.getCurrentDate = function () {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var day = now.getDate();
            var hour = now.getHours();
            var minute = now.getMinutes();
            if (month.toString().length == 1) {
                var month = '0' + month;
            }
            if (day.toString().length == 1) {
                var day = '0' + day;
            }
            if (hour.toString().length == 1) {
                var hour = '0' + hour;
            }
            if (minute.toString().length == 1) {
                var minute = '0' + minute;
            }
            var dateTime = hour + ':' + minute + ' ' + day + ':' + month + ':' + year;

            return {
                fullDate: dateTime,
                time: hour + ':' + minute,
                date: day + ':' + month + ':' + year
            }
        };

    if (AuthService.$getAuth()) {
        var uid = AuthService.$getAuth().uid;
        var ref = new Firebase(firebaseUrl);
        var notesRef = ref.child('notes');
        var notesArr = notesRef.child(uid + '-notes');
        var faNotesArr = $firebaseArray(notesArr);

        ns.getListPartial = function () {
            return $firebaseArray(notesArr.orderByChild('dateOfEditing').limitToLast(2)).$loaded();
        };

        ns.saveNote = function (ncurrent) {
            ncurrent.dateOfCreation = ncurrent.dateOfEditing = Firebase.ServerValue.TIMESTAMP;
            return $firebaseArray(notesArr).$add(ncurrent);
        };

        ns.removeNote = function(noteId) {
            var note = faNotesArr.$getRecord(noteId);

            return faNotesArr.$remove(note);
        }

        ns.updateNote = function (note) {
            var updateNote = null;

            note.editingsCount++;
            note.dateOfEditing = Firebase.ServerValue.TIMESTAMP;
            updatedNote = faNotesArr.$getRecord(note.$id);
            angular.copy(emptyToNull(note), updatedNote);

            return faNotesArr.$save(updatedNote);
        }
    }

    function emptyToNull(params) {
        Object.keys(params).forEach(function (item) {
            if (params[item] === undefined) {
                params[item] = null;
            }
        });

        return params;
    }

    return ns;
})
