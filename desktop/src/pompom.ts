interface round {
    name: string,
    duration: number
}

enum modes {
    "running",
    "waiting",
    "paused",
    "ready",
}

interface State {
    mode: modes,
    rounds: round[],
    currentRound: number,
    time: number
}

interface KeyboardControls {
    [key:string]: Function
}

interface Pompom {
    install: Function
}

export default function Pompom(this: Pompom){
    const readout = document.createElement("p");
    const mode = document.createElement("p");
    const rounds = document.createElement("p");
    const control = document.createElement("section");
    const app = document.createElement("main") as HTMLDivElement;
    const minuteFactor = 60000;
    
    const defaultRounds = [
        {name: "focus", duration: 25 * minuteFactor},
        {name: "rest", duration: 5 * minuteFactor},
        {name: "focus", duration: 25 * minuteFactor},
        {name: "rest", duration: 5 * minuteFactor},
        {name: "focus", duration: 25 * minuteFactor},
        {name: "rest", duration: 5 * minuteFactor},
        {name: "focus", duration: 25 * minuteFactor},
        {name: "rest", duration: 5 * minuteFactor},
    ]
    
    const keyboardControls:KeyboardControls = {
        ['r'] : () => run(reset),
        ['p'] : () => state.mode != modes.running ? run(start, tick) : run(pause),
        ['w'] : () => state.mode != modes.waiting && run(end),
    }

    let state:State = {
        mode: modes.ready,
        rounds: defaultRounds,
        currentRound: 0,
        time: defaultRounds[0].duration
    }    
    
    let timer: number
    let delta = [0,0]; 

    render(state);

    // this is so that it doesn't register a click if you're just moving it around the screen
    // doesn't work very well, needs a better solution
    control.addEventListener('mousedown', (e)=> delta = [e.clientX, e.clientY])
    control.addEventListener('mouseup', (e)  =>
        (e.clientX == delta[0] && e.clientY == delta[1]) 
        && state.mode != modes.running ? run(start, tick) : run(pause) );

    window.addEventListener('keydown', (e) => keyboardControls[e.key] && keyboardControls[e.key](e) );
    window.addEventListener('drop', (e) => {
        e.preventDefault()
        if(e.dataTransfer && e.dataTransfer.files[0].name.split(".").pop() == "csv"){
            read(e.dataTransfer.files[0]).then(csv => run(updateRounds(csv as string)))
        }
    })
    
    function render(ss:State){
        const t = formatTime(ss.time);

        document.title = ss.mode == modes.paused ? ':-)' : t;        

        app.className = modes[ss.mode];
        app.setAttribute('style', `--time-elapsed: ${percent(ss)}%`);
        readout.innerHTML = t;
        rounds.innerHTML = displayRounds(ss);
        mode.innerHTML = `${ss.rounds[ss.currentRound].name} ${ss.mode == modes.running ? '' : ':-)'}`;
    }
    
    function mutate(s:State) {
        render(s);
        state = s;
    }
    
    /**
     * 
     * @param f State -> State
     * @param ff State -> State, called every second
     * 
     * Accepts a state transforming function and sends the result to the mutate function, 
     * 
     * An optional second function is called every second on an interval, 
     * if no second function is provided then the interval is cleared.
     */
    function run(f:Function, ff?:Function){
        mutate(f(state))
        if(ff) {
            timer = setInterval(() => {
                if(state.time - 1000 < 1){ run(end); }
                else { mutate(ff(state)) }
            }, 1000) 
        } else if(state.mode != modes.running) { clearInterval(timer) }
    }
    
    function start(ss:State) { return {...ss, mode: modes.running } }
    function pause(ss:State) { return { ...ss, mode: modes.paused }; }
    
    function tick (ss:State) {
        return {
            ...ss,
            time: state.time - 1000,
            mode: modes.running
        }
    }
    function end(ss:State){
        let round = ss.currentRound + 1 < ss.rounds.length ? ss.currentRound + 1 : 0;
        return {
            ...ss,
            time: ss.rounds[round].duration,
            mode: modes.waiting,
            currentRound: round
        };
    }
    function reset(ss:State){
        return {
            ...ss,
            time: ss.rounds[0].duration,
            mode: modes.ready,
            currentRound: 0
        };
    }
    
    function percent(ss:State){
        return 100 - 100 * ss.time / ss.rounds[ss.currentRound].duration;
    }
    
    function formatTime(time:number){
        return `${Math.floor(time / minuteFactor)}:${((time % minuteFactor) / 1000).toFixed(0).padStart(2,'0')}`;
    }
    
    function displayRounds(ss:State){
        return `${[...Array(ss.rounds.length)].map((_, r) => r >= ss.currentRound ? 'o' : 'x').join("")}`;
    }

    function read(file:File){
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (event) => {
                if(!event.target) {  reject(); return; } 
                resolve(event.target.result as string);
            }
            reader.readAsText(file, 'UTF-8')
        })
    }

    function arrayToRound(a:string[]):round{
        return {name: a[0], duration: Number(a[1]) * minuteFactor + Number(a[2]) * 1000}
    }

    function updateRounds(csv:string){
        return (ss:State) => {            
            let newRounds = isValid(csv) ? csv.split('\n').map(l => arrayToRound(l.split(','))) : ss.rounds;
            return reset({...ss, rounds: newRounds})}
    }

    function isValid(csv:string){
        return csv.split("\n").some((l:string) => {
            let ll = l.split(",");
            return  typeof ll[0] == "string" && typeof Number(ll[1]) == "number" && typeof Number(ll[2]) == "number"
        })
    }

    this.install = function(el:HTMLElement){
        readout.id = "readout";
        mode.id = "mode";
        rounds.id = "rounds";
        control.id = "control";
        app.id = "app";

        // lets you use any point on the screen as a drag region
        [readout, mode, app, control, rounds].forEach(el => el.setAttribute("data-tauri-drag-region", "true") )

        control.append(readout);
        control.append(mode);
        control.append(rounds);

        app.append(control);
        el.append(app)
    }
}

