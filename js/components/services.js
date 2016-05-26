angular.module("app")

.service("AuthService", function($firebaseAuth, firebaseUrl) {
    var ref = new Firebase(firebaseUrl);

    return $firebaseAuth(ref);
})
.service("NotesService", function(AuthService, firebaseUrl, $firebaseArray) {
    var ns = {};

    if (AuthService.$getAuth()) {
        var uid = AuthService.$getAuth().uid;
        var ref = new Firebase(firebaseUrl);
        var notesRef = ref.child('notes');
        var notesArr = notesRef.child(uid + '-notes');
        var faNotesArr = $firebaseArray(notesArr);

        ns.getListPartial = function() {
            return $firebaseArray(notesArr.orderByChild('dateOfEditing').limitToLast(2)).$loaded();
        };

        ns.ncurrent = {};

        ns.initNote = function() {
            ns.ncurrent = {
                dateOfCreation: null,
                text: '',
                tags: '', // user default tag
                priority: 1,
                dateOfEditing: null,
                editingsCount: 0,
                sourceUrl: null
            };

            return ns.ncurrent;
        };

        ns.saveNote = function(ncurrent) {
            ncurrent.dateOfCreation = ncurrent.dateOfEditing = Firebase.ServerValue.TIMESTAMP;
            return $firebaseArray(notesArr).$add(ncurrent);
        };

        ns.updateNote = function(note) {
            var updateNote = null;

            note.editingsCount++;
            note.dateOfEditing = Firebase.ServerValue.TIMESTAMP;
            updatedNote = faNotesArr.$getRecord(note.$id);
            angular.copy(emptyToNull(note), updatedNote);

            return faNotesArr.$save(updatedNote);
        }

        ns.getCurrentDate = function() {
            var now     = new Date();
            var year    = now.getFullYear();
            var month   = now.getMonth()+1;
            var day     = now.getDate();
            var hour    = now.getHours();
            var minute  = now.getMinutes();
            if(month.toString().length == 1) {
                var month = '0'+month;
            }
            if(day.toString().length == 1) {
                var day = '0'+day;
            }
            if(hour.toString().length == 1) {
                var hour = '0'+hour;
            }
            if(minute.toString().length == 1) {
                var minute = '0'+minute;
            }
            var dateTime = hour + ':' + minute + ' ' + day + ':' + month + ':' + year;
             return dateTime;
        };
    } else {
        return null;
    }

    function emptyToNull(params) {
        Object.keys(params).forEach(function(item) {
            if (params[item] === undefined) {
                params[item] = null;
            }
        });

        return params;
    }

    return ns;
})
