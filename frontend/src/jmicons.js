//search all nodes with jmi classes, and replace them with svg tag
export function displayIcons()
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
    let uniqueId = Date.now();
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
    jmi_orinocoText : ['orinocoText', '0 0 480 115', 1, ['M 42.086436,0.25511223 C 12.038436,4.6251102 -1.7465644,34.38611 0.17643561,61.81211 c 1.56799999,22.38 16.93500039,42.232 40.91000039,38.699 19.441,-2.865 37.027,-21.733 40.536,-40.699 1.601,-8.651 0.256,-16.556 -1.648,-25 -1.377,-6.108 -1.308,-12.302 -4.291,-17.999 -5.644,-10.7839998 -21.508,-18.3169978 -33.597,-16.55799777 m -5,8.55699797 c -3.697,3.7359998 -8.83,5.4659998 -13,8.6809998 -4.4,3.391 -7.712,7.862 -12,11.319 2.138,-11.984 13.469,-18.9929998 25,-19.9999998 M 161.08644,43.81211 c 11.192,-2.36 15.966,-17.981 16,-28 -1.952,-0.511 -2.457,-0.733 -4,-2 -12.355,4.236 -12,19.214 -12,30 M 42.086436,15.43711 c 12.236,0.222 17.405,11.228 20.656,21.375 3.471,10.833 6.545,29.266 -2.075,38.671 -3.197,3.487 -8.142,5.009 -12.581,6.173 -2.944,0.772 -5.946,1.263 -9,1.108 -8.846,-0.447 -13.779,-9.406 -16.251,-16.952 -5.534,-16.893 -6.141,-50.835 19.251,-50.375 m 356.000004,13.375 c -2.912,2.263 -5.645,6.038 -9.089,7.397 -5.974,2.356 -13.638,0.855 -19.911,2.643 -15.21,4.336 -31.92,16.935 -36.069,32.96 -4.074,15.74 17.431,34.401 32.069,34.867 4.982,0.158 9.797,-2.314 14,-4.743 10.218,-5.905 21.351,-14.034 26,-25.124 -4.44,1.243 -7.204,4.404 -11,6.892 -6.714,4.4 -16.887,8.071 -25,6.637 -7.96,-1.408 -12.967,-6.448 -17.799,-12.529 -2.005,-2.522 -5.011,-5.478 -4.351,-9 1.458,-7.774 14.308,-17.046 21.15,-19.914 5.673,-2.379 15.156,-0.562 17.358,5.929 1.168,3.445 -0.48,7.491 -0.248,11.055 0.199,3.065 1.801,5.073 4.905,3.268 5.367,-3.121 4.391,-7.201 5.267,-12.338 1.545,-9.067 6.608,-18.73 2.718,-28 m -205,75 c 3.281,-1.106 5.415,-2.693 8,-5 0.841,2.467 1.778,4.699 3,7 3.284,-1.709 7.113,-4.094 8.048,-8.001 0.768,-3.207 -1.374,-6.938 -2.152,-9.999 -1.278,-5.024 -1.571,-9.883 -2.066,-15 -0.333,-3.447 -1.686,-7.556 0.198,-10.79 2.908,-4.994 13.492,-9.84 18.929,-7.027 3.393,1.755 5.224,5.489 6.73,8.817 3.185,7.038 4.238,15.352 2.988,23 -0.838,5.125 -3.158,9.812 -3.675,15 l 5,-1.999998 -1,3.999998 c 4.519,-1.269 10.628,-5.558 12.382,-10.17 1.262,-3.317 -0.416,-7.429 -0.622,-10.83 -0.424,-6.989 -0.256,-13.981 -0.735,-21 -0.395,-5.783 -0.562,-16.604 -6.239,-19.972 -10.936,-6.489 -25.498,5.513 -33.786,10.972 v -11 c -2.827,0.941 -4.673,2.123 -7,4 v -11 c -9.521,4.453 -9.889,13.651 -10.004,23 -0.058,4.7 -1.139,9.29 -0.956,14 0.417,10.697 2.501,21.319 2.96,32 m -84,-48 v -9 c -1.416,0.472 -1.814,0.814 -3,2 v -4 l -5,4 c -0.251,-1.452 -0.315,-1.752 -1,-3 -16.341004,11.763 -9.302004,29.359 -7.285004,46 0.54,4.462 -0.573,15.162 3.027,18.338 2.837,2.502 6.351004,-1.581 8.258004,-3.338 0.447,2.467 0.969,5.761 3.394,7.168 3.877,2.248 8.385,-3.745 8.803,-7.078 0.413,-3.298 -1.329,-6.924998 -2.003,-10.091 -0.707,-3.32 -0.375,-6.703 -1.248,-9.999 -1.419,-5.358 -4.426,-11.262 -3.758,-16.96 0.477,-4.076 4.3,-6.178 7.812,-7.481 9.771,-3.623 17.418,0.071 24,7.441 h 2 c 1.794,-3.749 2.86,-6.704 7,-8 -0.642,-3.306 -1.013,-7.06 -2.857,-9.957 -9.79,-15.379 -28.639,-5.133 -38.143,3.957 m 177,-11.362 c -17.976,5.138 -35.012,32.445 -25.597,50.358 6.542,12.448 20.102,14.004 32.597,14.004 3.878,0 8.25,0.521 12,-0.653 3.852,-1.206 6.998,-4.203 10,-6.775 6.68,-5.722 12.751,-14.32 12.816,-23.572 0.143,-20.113 -21.952,-39.039 -41.816,-33.362 m 152,-0.105 c -4.927,1.15 -9.233,4.579 -12.911,7.906 -11.538,10.44 -21.765,29.673 -12.119,44.557 8.091,12.485 29.59,14.972 43.03,11.446 4.408,-1.156 7.693,-4.322 10.985,-7.287 6.692,-6.027 11.75,-13.821 11.96,-23.155 0.459,-20.367 -21.093,-38.1 -40.945,-33.467 m -268,0.467 c -3.757,2.906 -7.845,5.453 -9.772,10.004 -2.69,6.353 -1.026,14.394 -0.398,20.996 1.007,10.578 1.332,21.377 2.17,32 1.952,0.511 2.457,0.733 4,2 4.774,-1.605 10.223,-3.863 12.103,-9.004 1.89,-5.167 -1.359,-12.674 -1.937,-17.996 -1.36,-12.511 -1.153,-24.494 -0.166,-37 -2.42,0.16 -3.802,0.009 -6,-1 m 113,13.344 c 10.906,-1.277 22.242,6.73 28.772,14.656 6.532,7.927 3.685,16.328 -5.772,19.64 -2.894,1.014 -5.946,1.858 -9,2.186 -8.617,0.926 -19.639,0.145 -24.853,-7.869 -5.981,-9.193 -1.158,-27.206 10.853,-28.613 m 151,-0.025 c 10.102,-1.38 22.427,6.208 28.521,13.696 6.506,7.995 5.369,16.597 -4.521,20.52 -2.553,1.013 -5.28,1.773 -8,2.165 -9.089,1.31 -20.65,0.564 -26.297,-7.715 -6.102,-8.946 -1.383,-27.07 10.297,-28.666 m -361.000004,6.681 c -3.765,18.194 -15.856,27 -34,27 5.096,-3.813 11.83,-4.592 17,-8.532 6.904,-5.262 11.015,-12.57 17,-18.468 m 243.000004,30 c -1.703,3.108 -3.82,4.472002 -7,6 1.755,-2.895 4.061,-4.345 7,-6 m 152,0 c -2.047,2.764 -3.948,4.412 -7,6 1.704,-3.155 3.714,-4.595 7,-6 z']],
    jmi_plusCircleFull : ['plusCircleFull', '0 0 512 512', 1, ['M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z']],
    jmi_minusCircleFull : ['minusCircleFull', '0 0 512 512', 1, ['M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zM124 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H124z']],
    jmi_brainOut : ['brainOut', '0 0 640 512', 1, ['M635 339.8l-96-95.2c-10.1-10-27-2.6-27 12.2V304h-79.9c-5.6 0-11.2-.1-17 .8-47.1 6.9-85.6 44.5-93.4 91.5-7.8 46.7 13.3 89.5 48.3 112.9 9.8 6.5 21.6-3.2 17.8-14.4-9-26.6-5.6-94.7 60.3-94.7h64v47.2c0 14.8 16.9 22.2 27 12.2l96-95.2c6.6-6.7 6.6-17.9-.1-24.5zM290 391c1.3-8 3.4-15.7 6.1-23.2V82c0-18.8 15.3-34 34.2-34 15.5 0 29.1 10.5 32.9 25.6l4.8 18.9 22.9-1.2c16.5.1 31.9 15.4 31.9 34.1 0 4.4-.4 5.3-5.5 27.2l18.9 7.7c13.7 5.6 42.7 30.2 25.1 65.9l-9.9 20.1 19.5 11.2c3.5 2 6.2 4.5 8.9 6.9v-7.8c0-22 14.5-40.4 34.2-46.5.1-1.7.7-3.4.7-5.1 0-33-16.7-63-43.7-80.6-.4-39.7-29.4-72.8-67.5-79.8C389.9 17.8 361.8 0 330.3 0c-22.8 0-43.4 9.2-58.3 24.1A82.316 82.316 0 0 0 213.7 0c-31.4 0-59.6 17.8-73.3 44.9-38.1 7-67.1 40.1-67.5 79.8-27.1 17.6-43.7 47.6-43.7 80.6 0 7.7 1 15.4 2.9 23C11.9 246.3 0 272.2 0 299.5c0 33 16.7 63 43.7 80.6.5 47.5 38.5 86.2 85.8 88.3 15.9 26.7 44.9 43.6 76.8 43.6 26 0 49.2-11.2 65.6-28.8 13.4 14.4 31.5 24.1 51.9 27.3-28-32.2-41-75.9-33.8-119.5zm-42.1 31.8c0 22.8-18.6 41.2-41.5 41.2-32.9 0-39.5-29.5-45.6-47.6l-20.3 3.4c-24 4-48.5-15.3-48.5-40.5 0-2.8 4.7-27.4 4.7-27.4l-18.2-7.5c-36.9-15.2-41.3-66.1-5.5-86.6l19.5-11.2-9.9-20.1C65 190.7 94 166 107.7 160.4l18.9-7.7c-5-21.9-5.5-22.8-5.5-27.2 0-18.8 15.3-34 31.9-34.1l22.9 1.2 4.8-18.9c3.9-15.1 17.4-25.6 32.9-25.6 18.9 0 34.2 15.2 34.2 34v340.7z']],
    jmi_brainIn : ['brainIn', '0 0 678 512', 2, ['m 213.69922,0 c -31.4,0 -59.59883,17.800391 -73.29883,44.900391 -38.1,7 -67.099999,40.098826 -67.499999,79.798829 -27.1,17.6 -43.701172,47.60156 -43.701172,80.60156 0,7.7 1.00039,15.4 2.90039,23 C 11.899609,246.30078 0,272.2 0,299.5 c 0,33 16.699219,62.99961 43.699219,80.59961 0.5,47.5 38.500781,86.20078 85.800781,88.30078 15.9,26.7 44.90078,43.59961 76.80078,43.59961 26,0 49.19961,-11.20078 65.59961,-28.80078 0.0116,0.0125 0.0235,0.0246 0.0352,0.0371 0.0117,-0.0125 0.0236,-0.0246 0.0352,-0.0371 16.4,17.6 39.59961,28.80078 65.59961,28.80078 31.9,0 60.90078,-16.89961 76.80078,-43.59961 17.92721,-0.79592 34.51229,-6.85864 48.23243,-16.65625 -4.31813,-0.61097 -8.56213,-1.73769 -12.59961,-3.38867 -5.0322,-2.10568 -9.86478,-4.86677 -13.87696,-8.5957 -6.75875,-6.62917 -13.50304,-13.27291 -20.24414,-19.91993 -4.09722,0.63416 -8.31108,0.66105 -12.51172,-0.0391 l -20.30078,-3.40039 c -6.1,18.1 -12.69961,47.59961 -45.59961,47.59961 -22.9,0 -41.5,-18.39922 -41.5,-41.19922 h 0.0996 V 82.099609 c 0,-18.8 15.30117,-34 34.20117,-34 15.5,0 29.0004,10.499612 32.9004,25.59961 l 4.79882,18.90039 22.90039,-1.199218 c 16.6,0.1 31.90039,15.299609 31.90039,34.099609 0,4.4 -0.5,5.29922 -5.5,27.19922 l 18.9004,7.70117 c 1.98738,0.81236 4.30179,2.03907 6.74414,3.63086 7.38377,-4.49753 15.85527,-7.25502 24.50586,-7.65234 4.87428,-0.18674 9.77356,0.3211 14.51562,1.45898 11.05729,2.56619 21.00837,9.11479 28.125,17.91602 -6.69773,-20.86235 -20.39379,-38.91134 -39.0918,-51.05469 -0.4,-39.700008 -29.4,-72.798829 -67.5,-79.798829 C 389.7707,17.800391 361.57187,0 330.17188,0 A 82.316,82.316 0 0 0 271.93555,24.035156 82.316,82.316 0 0 0 213.69922,0 Z m -0.0996,48.099609 c 18.9,0 34.20117,15.2 34.20117,34 V 422.80078 h 0.0996 c 0,22.8 -18.6,41.19922 -41.5,41.19922 -32.9,0 -39.49961,-29.49961 -45.59961,-47.59961 L 140.5,419.80078 c -24,4 -48.5,-15.3 -48.5,-40.5 0,-2.8 4.699219,-27.40039 4.699219,-27.40039 L 78.5,344.40039 C 41.6,329.20039 37.2,278.30078 73,257.80078 L 92.5,246.59961 82.599609,226.5 c -17.6,-35.8 11.399609,-60.49961 25.099611,-66.09961 l 18.90039,-7.70117 c -5,-21.9 -5.5,-22.79922 -5.5,-27.19922 0,-18.8 15.30039,-33.999609 31.90039,-34.099609 l 22.90039,1.199218 4.79883,-18.90039 c 3.9,-15.1 17.40039,-25.59961 32.90039,-25.59961 z', 'm 362.87644,292.07479 95.99999,-95.2 c 10.1,-10 27,-2.6 27,12.2 v 47.2 h 79.9 c 5.6,0 11.2,-0.1 17,0.8 47.1,6.9 85.59996,44.5 93.39996,91.5 7.8,46.7 -13.3,89.5 -48.29996,112.9 -9.8,6.5 -21.6,-3.2 -17.8,-14.4 9,-26.6 5.6,-94.7 -60.3,-94.7 h -64 v 47.2 c 0,14.8 -16.9,22.2 -27,12.2 l -95.99999,-95.2 c -6.6,-6.7 -6.6,-17.9 0.1,-24.5 z']],
    jmi_trashFill : ['trashFill', '0 0 16 16', 1,['M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z']],
    jmi_plusSimple : ['plusSimple', '0 0 16 16', 1, ['M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z']],
    jmi_minusSimple : ['minusSimple', '0 0 16 16', 1, ['M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z']],
    jmi_home : ['home', '0 0 576 512', 1, ['M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z']]
};