function ajax(url, method = 'GET') {
    return new Promise((resolve, reject) => 
    {
        let request = new XMLHttpRequest();
        request.open(method, url);

        request.addEventListener('load', function()
        {
            if (request.status >= 200) {
                resolve(JSON.parse(request.response));
            } else {
                reject(request.statusText)
            }
        })

        request.setRequestHeader("Content-Type", "application/JSON;charset=UTF-8");
        request.send();

    })
}