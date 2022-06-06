
class Logger {
    #logToConsole;

    constructor(logtoConsole = false)
    {
        this.#logToConsole = logtoConsole;
    }

    log(log_msg)
    {
        if(this.#logToConsole == true)
            console.log(log_msg);
    }

    error(log_msg)
    {
        this.log(log_msg);
    }
    
}

module.exports = Logger;