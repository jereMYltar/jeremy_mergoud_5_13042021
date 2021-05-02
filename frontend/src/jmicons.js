//search all nodes with jmi classes, and replace them with svg tag
export function iconGen()
{
    jmClassCreator();
    let elements = document.querySelectorAll('i[class*="jmi"]');
    elements.forEach(element => {
        let name = "";
        let colorsArray = [];
        let classesArray = [];
        let classes = element.getAttribute('class').split(' ');
        classes.forEach(classe =>
        {
            switch (true) {
                case classe.startsWith('jmi') :
                    name = classe;
                    if (isNaN(icons[name][2])) {
                        for (let c = 0; c < icons[name][2].length; c++)
                        {
                            colorsArray[c] = icons[name][2][c];
                        }
                    }
                    break;
                case classe.startsWith('jmc') :
                    colorsArray.unshift(classe.substring(4));
                    while (colorsArray.length > icons[name][3].length)
                    {
                        colorsArray.pop();
                    }
                    break;
                default :
                    classesArray.push(classe);
            }
        });
        completeColors(name, colorsArray);
        svgCreator(element, name, colorsArray, classesArray);
    });
}

//create the generic jm class
function jmClassCreator ()
{
    let sheet = document.createElement('style');
    sheet.innerHTML = `.jm {
        overflow: visible;
        width: 1em;
        height: 1em;
        vertical-align: -.125rem;
        display: inline-block;
        font-size: inherit;}
        `;
    document.body.appendChild(sheet);
}

//completes the color chart, and formats them to make them usable 
function completeColors (name, colors)
{
    if (icons[name][3].length > colors.length) {
        if (colors.length === 0) {
            colors.push('currentColor');
            addMissingColors(name, colors);
        } else {
            addHashtag(colors);
            addMissingColors(name, colors);
        }
    } else {
        addHashtag(colors);
    }
}

//add shades of grey to have as many colors in the colors array than the number of paths 
function addMissingColors (name, colors)
{
    let diff = icons[name][3].length - colors.length;
    let c = Math.floor(256/(diff + 1));
    for (let n = 1; n <= diff; n++) {
        let tint = n * c;
        colors.push(`rgb(${tint},${tint},${tint})`);
    }
}

//add hashtags in front of given colors to transform them into hexadecimal values
function addHashtag (colors)
{
    for (let n = 0; n < colors.length ; n++)
    {
        (/^[0-9a-fA-F]{6,8}$/.test(colors[n])) ? (colors[n] = `#${colors[n]}`) : '';
    }
}

//creates the <svg> tag, insert it after <i> then delete <i>
function svgCreator (element, name, colors, classes)
{
    let icon = `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" role="img" viewBox="${icons[name][1]}" class="jm`;
    for (let i = 0; i < classes.length; i++)
    {
        icon += ` ${classes[i]}`;
    }
    icon += `"><g> ${pathCreator(name, colors)} </g></svg>`;

    element.insertAdjacentHTML('afterend', icon);
    element.parentNode.removeChild(element);
}

//creates elements needed by svg tags : colors, linear or radial gradients and paths
function pathCreator (name, colors)
{
    let path = "";
    for (let i = 0; i < icons[name][3].length; i++) {
        if (colors[i][0] == "linear") { //if colors[i] is a linear gradient
            path += linearDefsConstruct (name, colors, i);
        } else if (colors[i][0] == "radial") { //if colors[i] is a radial gradient
            path += radialDefsConstruct (name, colors, i);
        } else if (/^(#[0-9a-fA-F]{6,8})|(currentColor)$/.test(colors[i])) { //if colors[i] is a hexadecimal value
            path += `<path fill=${colors[i]} d="${icons[name][3][i]}"></path>`;
        } else { //sinon
            path += `<path fill="currentColor" d="${icons[name][3][i]}"></path>`;
        }
    }
    return path;
}

//creates linear gradient and path tag
function linearDefsConstruct (name, colors, i)
{
    let uniqueId = Math.random().toString(36).slice(-8);
    return `<defs><linearGradient id='gradient_${uniqueId}'
            x1=${colors[i][1][0].toString()} 
            y1=${colors[i][1][1].toString()} 
            x2=${colors[i][1][2].toString()} 
            y2=${colors[i][1][3].toString()}>
            ${stopConstruct(colors, i)}
            </linearGradient></defs>
            <path fill="url(#gradient_${uniqueId})" d="${icons[name][3][i]}"></path>`;
}

//creates radial gradient and path tag
function radialDefsConstruct (name, colors, i)
{
    let uniqueId = Math.random().toString(36).slice(-8);
    return `<defs><radialGradient id='gradient_${uniqueId}'
            cx=${colors[i][1][0].toString()} 
            cy=${colors[i][1][1].toString()} 
            r=${colors[i][1][2].toString()} 
            ${(colors[i][1][3] && colors[i][1][4]) ? `fx=${colors[i][1][3].toString()} fy=${colors[i][1][4].toString()}` : ''}
            ${(colors[i][3]) ? ` spreadMethod="${colors[i][3]}">` : `>`}
            ${stopConstruct(colors, i)}
            </radialGradient></defs>
            <path fill="url(#gradient_${uniqueId})" d="${icons[name][3][i]}"></path>`;
}

//creates stop tags for linear and radial gradients
function stopConstruct(colors, i)
{
    let stops = "";
    for (let c = 0; c < colors[i][2].length; c++)
    {
        stops += `<stop offset=${colors[i][2][c][0].toString()} stop-color=${colors[i][2][c][1].toString()}`;
        (colors[i][2][c][2]) ? stops += ` stop-opacity=${colors[i][2][c][2].toString()} />` : stops += ` />` ;
    }
    return stops;
}

/*chaque svg est un élément de l'objet comme suit :
    - la clef est le nom de la classe : jmi_ suivi du nom de l'icône
    - la valeur est un tableau de 4 éléments :
        * le premier est le nom de l'icône
        * le deuxième est la viewBox du SVG (valeur de l'attribut éponyme)
        * le troisième est soit 
            - le nombre de couleurs nécessaires pour l'icône
            - un tableau des couleurs requis par l'icône lorsque les couleurs importent, par exemple pour une marque. Les couleurs sont au format hexadécimal (avec ou sans #)
        * le quatrième est un tableau des chemins composant le SVG
*/
let icons = {
    jmi_basket : ['basket', "0 0 16 16", 1, ['M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9H2zM1 7v1h14V7H1zm3 3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 4 10zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 6 10zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 10zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z']],
    jmi_airConditionner : ['airConditionner', "0 0 576 512", [["linear", [0.2,0.2,0.8,0.8], [[0, "#00FFFF4D"], [1,"#0000FFFF"]]], ["linear", [0.2,0.2,0.8,0.8], [[0, "#8f5bfe"], [1,"#e88b04"]]]], ['M216,424a40,40,0,0,1-40,40h-6.22c-20,0-38.19-13.88-41.28-33.61-2.88-18.41,6.92-34.22,21.84-41.47,5.73-2.78,9.66-8.25,9.66-14.63V356.67a16.1,16.1,0,0,0-21.42-15.17A87.55,87.55,0,0,0,80.7,435.24C86.26,479.82,126.55,512,171.48,512H176a88,88,0,0,0,88-88V256H216ZM437.42,309.5A16.1,16.1,0,0,0,416,324.67v17.62c0,6.38,3.93,11.85,9.66,14.63,14.92,7.25,24.72,23.06,21.84,41.47C444.41,418.12,426.2,432,406.23,432H400a40,40,0,0,1-40-40V256H312V392a88,88,0,0,0,88,88h4.53c44.92,0,85.21-32.18,90.77-76.76A87.55,87.55,0,0,0,437.42,309.5ZM64,128v32H512V128Z', 'M544,0H32A32,32,0,0,0,0,32V192a32,32,0,0,0,32,32H544a32,32,0,0,0,32-32V32A32,32,0,0,0,544,0ZM512,160H64V128H512Z']],
    jmi_expandArrows : ['expandArrows', "0 0 16 16", 1, ['M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z']],
    jmi_500px : ['500px', "0 0 448 512", 1, ['M103.3 344.3c-6.5-14.2-6.9-18.3 7.4-23.1 25.6-8 8 9.2 43.2 49.2h.3v-93.9c1.2-50.2 44-92.2 97.7-92.2 53.9 0 97.7 43.5 97.7 96.8 0 63.4-60.8 113.2-128.5 93.3-10.5-4.2-2.1-31.7 8.5-28.6 53 0 89.4-10.1 89.4-64.4 0-61-77.1-89.6-116.9-44.6-23.5 26.4-17.6 42.1-17.6 157.6 50.7 31 118.3 22 160.4-20.1 24.8-24.8 38.5-58 38.5-93 0-35.2-13.8-68.2-38.8-93.3-24.8-24.8-57.8-38.5-93.3-38.5s-68.8 13.8-93.5 38.5c-.3.3-16 16.5-21.2 23.9l-.5.6c-3.3 4.7-6.3 9.1-20.1 6.1-6.9-1.7-14.3-5.8-14.3-11.8V20c0-5 3.9-10.5 10.5-10.5h241.3c8.3 0 8.3 11.6 8.3 15.1 0 3.9 0 15.1-8.3 15.1H130.3v132.9h.3c104.2-109.8 282.8-36 282.8 108.9 0 178.1-244.8 220.3-310.1 62.8zm63.3-260.8c-.5 4.2 4.6 24.5 14.6 20.6C306 56.6 384 144.5 390.6 144.5c4.8 0 22.8-15.3 14.3-22.8-93.2-89-234.5-57-238.3-38.2zM393 414.7C283 524.6 94 475.5 61 310.5c0-12.2-30.4-7.4-28.9 3.3 24 173.4 246 256.9 381.6 121.3 6.9-7.8-12.6-28.4-20.7-20.4zM213.6 306.6c0 4 4.3 7.3 5.5 8.5 3 3 6.1 4.4 8.5 4.4 3.8 0 2.6.2 22.3-19.5 19.6 19.3 19.1 19.5 22.3 19.5 5.4 0 18.5-10.4 10.7-18.2L265.6 284l18.2-18.2c6.3-6.8-10.1-21.8-16.2-15.7L249.7 268c-18.6-18.8-18.4-19.5-21.5-19.5-5 0-18 11.7-12.4 17.3L234 284c-18.1 17.9-20.4 19.2-20.4 22.6z']],
    jmi_gMail : ['gMail', "52 42 88 66", ["4285F4","C5221F","EA4335","FBBC04","34A853"], ['M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6','M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2','M72 74V48l24 18 24-18v26L96 92','M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2','M120 108h14c3.32 0 6-2.69 6-6V59l-20 15']],
    jmi_orinocoIco : ['orinocoIco', '0 0 32 32', [["radial", [0.6,0.4,0.2,0.75,0.4], [[0, "#8f5bfe"], [1,"#e88b04"]], 'reflect']], ['m 3.3342652,3.8776887 0.0677,0.228723 0.034,0.08472 0.0974,0.296485 0.0465,0.152482 0.0805,0.304964 0.0381,0.152482 0.0465,0.152482 0.0933,0.304964 0.0465,0.152482 0.0805,0.304963 0.0381,0.152482 0.0465,0.152482 0.0933,0.304964 0.0465,0.152482 0.0805,0.304963 0.0381,0.152482 0.0465,0.152482 0.0933,0.304964 0.0465,0.152482 0.0381,0.152482 0.0805,0.304963 0.0465,0.152482 0.0467,0.152482 0.0508,0.152482 0.10171,0.304964 0.0466,0.152482 0.0465,0.1524816 0.0805,0.304963 0.0381,0.152482 0.0465,0.152482 0.0933,0.3049637 0.0465,0.152482 0.0805,0.304964 0.0381,0.152481 0.0465,0.152482 0.0933,0.304964 0.0465,0.152482 0.0805,0.304964 0.0381,0.152482 0.0465,0.152481 0.0933,0.304964 0.0465,0.152482 0.0381,0.152482 0.0805,0.304964 0.0465,0.152482 0.0933,0.304963 0.0465,0.152482 0.0381,0.152482 0.0805,0.304964 0.0465,0.152482 0.0933,0.304964 0.0465,0.152481 0.0381,0.152482 0.0805,0.304964 0.0465,0.152482 0.0467,0.152482 0.1017,0.304964 0.0508,0.152482 0.0467,0.152482 0.0465,0.152481 0.0805,0.304964 0.0381,0.152482 0.0465,0.152482 0.0933,0.304964 0.0465,0.152482 0.0381,0.152481 0.0805,0.304964 0.0932,0.304964 0.0932,0.304964 0.0805,0.304963 0.0381,0.152482 0.0465,0.152482 0.0467,0.152482 0.0889,0.304964 0.0255,0.152482 0.0127,0.152482 -0.0465,0.304963 -0.11863,0.304964 -0.0762,0.152482 -0.13129,0.304964 -0.11863,0.304964 -0.0636,0.152481 -0.12275,0.304964 -0.11863,0.304964 -0.13129,0.304964 -0.0762,0.152482 -0.13129,0.304963 -0.11863,0.304964 -0.0636,0.152482 -0.12275,0.304964 -0.11863,0.304964 -0.13129,0.304963 -0.0762,0.143943 -0.0636,0.152482 -0.0508,0.08478 -0.0762,0.228723 0.22872,-0.01266 0.0848,-0.02119 0.15248,-0.02547 0.29643,-0.06358 0.30069,-0.07624 0.13983,-0.06343 0.12275,-0.09317 0.18648,-0.258457 0.0677,-0.148213 0.0679,-0.152481 0.0592,-0.152482 0.0636,-0.152482 0.11863,-0.304964 0.12274,-0.304964 0.0636,-0.152482 0.11863,-0.304963 0.13129,-0.304964 0.0762,-0.152482 0.13128,-0.304964 0.11864,-0.304964 0.12274,-0.304963 0.0636,-0.152482 0.11863,-0.304964 0.0636,-0.143943 0.0592,-0.152482 0.0467,-0.08478 0.0762,-0.228722 h 14.4857798 3.65956 0.45745 0.15248 l 0.30496,-0.0043 0.15248,-0.0084 0.30497,-0.06359 0.14821,-0.0677 0.1441,-0.08478 0.24138,-0.241379 0.15248,-0.292308 0.0424,-0.152482 0.0338,-0.152482 0.0593,-0.304963 0.0339,-0.152482 0.0593,-0.304964 0.0593,-0.304964 0.0381,-0.152482 0.0338,-0.152482 0.0424,-0.152481 0.072,-0.304964 0.0297,-0.152482 0.0592,-0.304964 0.0297,-0.152482 0.0636,-0.304963 0.0592,-0.304964 0.0297,-0.152482 0.072,-0.304964 0.0424,-0.152482 0.0338,-0.152482 0.0381,-0.152482 0.0297,-0.152482 0.0592,-0.304963 0.0636,-0.304964 0.0593,-0.304964 0.0593,-0.304964 0.0381,-0.152481 0.0339,-0.152482 0.0424,-0.152482 0.072,-0.304964 0.0593,-0.304964 0.0593,-0.304964 0.0636,-0.304963 0.0592,-0.304964 0.0297,-0.152482 0.072,-0.304964 0.0424,-0.152482 0.0339,-0.152481 0.0381,-0.152482 0.0297,-0.152482 0.0592,-0.304964 0.0636,-0.3049637 0.0593,-0.304964 0.0593,-0.3049626 0.0381,-0.152482 0.0339,-0.152482 0.0424,-0.152482 0.072,-0.304964 0.0297,-0.152482 0.0592,-0.304963 0.0636,-0.304964 0.0593,-0.304964 0.0593,-0.304964 0.0338,-0.152481 0.0467,-0.304964 0.008,-0.143943 0.004,-0.152482 v -0.313503 l -0.22872,-0.148212 -0.23726,-0.08905 -0.29643,-0.05504 -0.30496,-0.01266 h -0.30497 -0.15248 -0.30496 -0.76241 -5.18439 -19.2127098 l -0.0127,-0.228723 -0.0509,-0.237201 -0.0422,-0.144004 -0.0933,-0.304964 -0.0465,-0.152482 -0.0381,-0.152482 -0.0805,-0.304963 -0.0932,-0.304964 -0.0508,-0.152482 -0.10597,-0.304964 -0.0593,-0.148243 -0.16513,-0.262619 -0.24138,-0.182125 -0.1441,-0.0593 -0.14821,-0.04658 -0.30496,-0.05084 -0.30497,-0.0127 h -0.15248 -0.30496 -0.76241 -0.30497 l -0.30496,0.0042 -0.15248,0.0085 -0.30497001,0.05084 -0.15248,0.04658 -0.28803998,0.13978 -0.21179,0.224484 -0.0889,0.288023 0.0169,0.300725 0.0381,0.144019 0.15248,0.241425 0.24138,0.152482 0.29229998,0.0593 0.15249,-0.0042 0.15248001,-0.02964 0.15248,-0.05506 0.15248,-0.08048 0.30497,-0.165199 0.15248,-0.05506 0.15248,-0.03388 0.15248,-0.0127 0.30497,-0.0042 h 0.30496 0.60993 m 3.50708,20.9536023 -0.30496,0.09317 -0.30497,0.131287 -0.14821,0.08051 -0.1441,0.09317 -0.25403,0.211797 -0.2118,0.254035 -0.0974,0.144095 -0.0848,0.148213 -0.14822,0.304964 -0.0593,0.152481 -0.0339,0.152482 -0.0255,0.152482 -0.0127,0.304964 v 0.152482 l 0.0127,0.304964 0.0255,0.152481 0.0339,0.152482 0.0593,0.152482 0.15249,0.304964 0.0932,0.152482 0.24565,0.292308 0.29231,0.245648 0.30496,0.182063 0.30497,0.122901 0.30496,0.05931 0.30496,0.01266 h 0.30497 l 0.30496,-0.01266 0.30496,-0.05931 0.15249,-0.05932 0.15248,-0.06358 0.30496,-0.182063 0.14821,-0.118631 0.1441,-0.127017 0.24565,-0.292308 0.18206,-0.304964 0.0636,-0.152482 0.0593,-0.152482 0.0339,-0.152482 0.0255,-0.152481 0.0127,-0.304964 v -0.152482 l -0.0127,-0.304964 -0.0255,-0.152482 -0.0339,-0.152482 -0.0593,-0.152481 -0.14822,-0.304964 -0.0848,-0.148213 -0.0974,-0.144095 -0.2118,-0.254035 -0.25403,-0.211797 -0.1441,-0.09317 -0.14821,-0.08051 -0.30497,-0.131287 -0.30496,-0.09317 -0.30496,-0.05093 h -0.30497 l -0.30496,0.05093 m 18.6027898,-0.0043 -0.15248,0.03812 -0.30497,0.0889 -0.15248,0.05931 -0.15248,0.07624 -0.30069,0.199141 -0.1441,0.122748 -0.24565,0.275383 -0.0932,0.148212 -0.0889,0.152482 -0.1229,0.304964 -0.072,0.304963 -0.0467,0.304964 -0.0127,0.152482 v 0.152482 l 0.0339,0.304964 0.0593,0.304963 0.0424,0.152482 0.13982,0.304964 0.0932,0.148212 0.10155,0.144096 0.233,0.254035 0.27538,0.211797 0.14821,0.09317 0.30496,0.139826 0.15249,0.03812 0.30496,0.03385 0.15248,0.0043 h 0.30496 0.15249 l 0.30496,-0.01266 0.15248,-0.02546 0.15248,-0.03385 0.30497,-0.122901 0.30069,-0.182063 0.1441,-0.118631 0.24565,-0.271113 0.0932,-0.148212 0.0889,-0.152482 0.13556,-0.304964 0.055,-0.152482 0.0509,-0.152482 0.0422,-0.152481 0.0467,-0.304964 v -0.152482 l -0.0424,-0.304964 -0.0381,-0.152482 -0.0805,-0.304963 -0.0465,-0.152482 -0.15675,-0.304964 -0.11436,-0.152482 -0.12702,-0.148212 -0.1441,-0.144096 -0.30069,-0.241379 -0.30496,-0.165137 -0.15249,-0.05932 -0.30496,-0.09317 -0.30496,-0.05093 -0.15249,-0.0041 -0.15248,0.0041 -0.30496,0.04666 m -16.0105998,0.39813 0.0424,0.228723 0.0889,0.237262 0.0593,0.143943 0.0762,0.143943 0.0636,0.152482 0.0508,0.08478 0.0762,0.228722 H 23.155965 l 0.15248,-0.228722 0.0381,-0.08478 0.0932,-0.152482 0.16514,-0.287886 0.0552,-0.08478 0.10582,-0.228723 -0.22872,-0.110092 -0.0848,-0.0043 -0.15249,-0.02958 -0.14394,-0.0043 -0.30496,-0.0043 h -0.30497 -0.60992 -2.74468 z']],
    jmi_plusCircleFull : ['plusCircleFull', '0 0 512 512', 1, ['M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z']],
    jmi_minusCircleFull : ['minusCircleFull', '0 0 512 512', 1, ['M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zM124 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H124z']]
};