function has(key)
{
    if (!!localStorage.getItem(key))
    {
        return true;
    }
    return false;
}

function get(key)
{
    if (has(key))
    {
        return JSON.parse(localStorage.getItem(key));
    }
    return 0;
}

function set(key, value)
{
    localStorage.setItem(key, JSON.stringify(value));
}

function