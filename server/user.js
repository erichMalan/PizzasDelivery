class User{    
    constructor(id, email, hash) {
        if(id)
            this.id = id;
        this.email = email;
        this.hash = hash;
    }
}

module.exports = User;
