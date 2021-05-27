export class Storage {

    constructor()
    {
        this.location = localStorage;
    }
    
    has(key)
    {
        return (!this.location.getItem(key));
    }
    
    get(key)
    {
        if (this.has(key))
        {
            this.location.setItem(key, "{}");
        }
        return JSON.parse(this.location.getItem(key));
    }
    
    set(key, value)
    {
        this.location.setItem(key, JSON.stringify(value));
    }
    
    remove(key)
    {
        this.location.removeItem(key);
    }
}