function getUrlParam(parameter, defaultvalue){
    const queryString = window.location.search;
    console.log(queryString);

    const urlParams = new URLSearchParams(queryString);
    
    if(urlParams.has(parameter))
      return urlParams.get(parameter);
    else
      return defaultvalue;
}

function get2Digits(val)
{
  return (val < 10 ? '0' : '') +val;
}

function createDataTable(values)
{
    for(let a =0; a < values.length; a++)
    {
        let entry = JSON.parse(values[a]);

        let first = entry.Time;
        let second = 0;
        let fifth = 0;
        let third = 0;
        let forth = 0;
        let six = 0;

        for(let b=0; b < 4; b++)
        {
            let entrymodtype  = entry.Data[b].modulation;
            let modValue = returnModulation(entrymodtype);
            let channelid = parseInt(entry.Data[b].channelID);

            switch(channelid) {
                case 12:
                    second = modValue;
                    writeToAnalyse(1, entry.Data[b].modulation);
                    break;
                case 11:
                    third = modValue;
                    writeToAnalyse(2, entry.Data[b].modulation);
                    break;
                case 10:
                    forth = modValue;
                    writeToAnalyse(3, entry.Data[b].modulation);
                    break;
                case 9:                                       
                    fifth = modValue;
                    writeToAnalyse(4, entry.Data[b].modulation);
                    break;
            }
        }

        let entrymodtype  = entry.Data31[0].modulation;
        six = returnModulation(entrymodtype);
        writeToAnalyse(5, entrymodtype);

        qfactorTable[a] = ((second+third+forth+fifth)/2.56);
        
        resultTables[0][a] = second;
        resultTables[1][a] = third;
        resultTables[2][a] = forth;
        resultTables[3][a] = fifth;
        resultTables[4][a] = six;

        resultLabel[a] = first.substr(11,8);
    }

    isTablesInit = true;
    //return resultTable;
}

function returnModulation(mod)
{
    if(mod == "64QAM")
        return 64;

    if(mod == "32QAM")
        return 32;

    if(mod == "16QAM")
        return 16;

    if(mod == "8QAM")
        return 8;

    if(mod == "4QAM")
        return 0;

    return 0;
}

function writeToAnalyse(kan, type)
{
        switch(type) {
            case "64QAM":
                window['analyseObj'+kan].IS64++;
                break;
            case "32QAM":
                window['analyseObj'+kan].IS32++;
                break;
            case "16QAM":
                window['analyseObj'+kan].IS16++;
                break;
            case "8QAM":
                window['analyseObj'+kan].IS8++;
                break;
            case "4QAM":
                window['analyseObj'+kan].IS4++;
                break;
            
        }
}

function getSumOfQFactorPercent()
{
    let sumOfValues = 0;

    for(let c=0; c < qfactorTable.length; c++)
    {
        sumOfValues+= qfactorTable[c];
    }

    return Math.round((sumOfValues / qfactorTable.length));
}
