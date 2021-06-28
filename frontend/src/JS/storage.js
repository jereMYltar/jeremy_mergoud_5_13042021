export class Storage {

    constructor()
    {
        this.engine = localStorage;
    }
    
    has(key)
    {
        return (!!this.engine.getItem(key));
    }
    
    get(key)
    {
        if (!this.has(key))
        {
            this.engine.setItem(key, "{}");
        }
        return JSON.parse(this.engine.getItem(key));
    }
    
    set(key, value)
    {
        this.engine.setItem(key, JSON.stringify(value));
    }
    
    remove(key)
    {
        this.engine.removeItem(key);
    }

    clearCart()
    {
        this.engine.clear();
    }
}