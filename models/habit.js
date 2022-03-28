const db = require ('../dbConfig/init');
const User = require ('./user');

module.exports = class Habit
{

    constructor(data)
    {
        this.id = data.id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.frequency = data.frequency;
        this.timestampOfLastTrack = data.timestampOfLastTrack;
        this.streak = data.streak;
        //this.type = data.type; may not track this
    }


}