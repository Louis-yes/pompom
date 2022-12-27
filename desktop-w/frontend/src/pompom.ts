interface round {
    name: string,
    duration: number
}

export enum modes {
    "running",
    "waiting",
    "paused",
    "ready",
}

export interface State {
    mode: modes,
    rounds: round[],
    currentRound: number,
    time: number
}

interface KeyboardControls {
    [key:string]: Function
}

export interface Pompom {
    install: Function
    state: State
}

const minuteFactor = 60000;

export default function Pompom(this: Pompom){
    const readout = document.createElement("p");
    const mode = document.createElement("p");
    const rounds = document.createElement("p");
    const control = document.createElement("section");
    // const debug = document.createElement("textarea");
    const app = document.createElement("main") as HTMLDivElement;
    
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
        ['n'] : () => state.mode != modes.waiting && run(end),
    }

    let state:State = {
        mode: modes.ready,
        rounds: defaultRounds,
        currentRound: 0,
        time: defaultRounds[0].duration
    }    
    
    let timer: number;

    render(state);

    // this is so that it doesn't register a click if you're just moving it around the screen
    // doesn't work very well, needs a better solution
    control.addEventListener('click', ()  => state.mode != modes.running ? run(start, tick) : run(pause) );

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
        rounds.innerHTML = displayRounds(ss.currentRound, ss.rounds);
        mode.innerHTML = `${ss.rounds[ss.currentRound].name} ${ss.mode == modes.running ? '' : ':-)'}`;
        // debug.value = JSON.stringify(ss, null, "\t")
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
            timer = window.setInterval(() => {
                if(state.time - 1000 < 1){ run(end); }
                else { mutate(ff(state)) }
            }, 1000) as number
        } else if(state.mode != modes.running) { clearInterval(timer) }
    }


    function tick (ss:State) {
        return {
            ...ss,
            time: ss.time - 1000,
            mode: modes.running
        }
    }

    this.install = function(el:HTMLElement){
        readout.id = "readout";
        mode.id = "mode";
        rounds.id = "rounds";
        control.id = "control";
        app.id = "app";

        // lets you use any point on the screen as a drag region
        [readout, mode, app, control, rounds].forEach(el => el.setAttribute("style", "--wails-draggable:drag;") )

        control.append(readout);
        control.append(mode);
        control.append(rounds);

        app.append(control);
        // app.append(debug)
        el.append(app)
    }

    this.state = state
}


export function start(ss:State) { return {...ss, mode: modes.running } }
export function pause(ss:State) { return { ...ss, mode: modes.paused }; }

export function end(ss:State){
    let round = ss.currentRound + 1 < ss.rounds.length ? ss.currentRound + 1 : 0;
    return {
        ...ss,
        time: ss.rounds[round].duration,
        mode: modes.waiting,
        currentRound: round
    };
}
export function reset(ss:State){
    return {
        ...ss,
        time: ss.rounds[0].duration,
        mode: modes.ready,
        currentRound: 0
    };
}
export function percent(ss:State){
    return 100 - 100 * ss.time / ss.rounds[ss.currentRound].duration;
}

export function formatTime(time:number){
    return `${Math.floor(time / minuteFactor)}:${((time % minuteFactor) / 1000).toFixed(0).padStart(2,'0')}`;
}
export function displayRounds(cr:State["currentRound"], rr: State["rounds"]){
    let str = Array(Math.floor(rr.length/2) + rr.length % 2).fill("")
    let p = str.map((_,i) => {
        return  cr/2 >= i ? 'x' : 
                rr.length % 2 && cr == rr.length -1 ? 'x' : 'o' 
    }).join("")
    return p
}

export function read(file:File){
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
            if(!event.target) {  reject(); return; } 
            resolve(event.target.result as string);
        }
        reader.readAsText(file, 'UTF-8')
    })
}

export function arrayToRound(a:string[]):round{
    return {name: a[0], duration: Number(a[1]) * minuteFactor + Number(a[2]) * 1000}
}

export function updateRounds(csv:string){
    return (ss:State) => {            
        let newRounds = isValid(csv) ? csv.trim().split('\n').map(l => arrayToRound(l.split(','))) : ss.rounds;
        return reset({...ss, rounds: newRounds})}
}

export function isValid(csv:string){
    let res = csv.trim().split("\n").some((l:string) => {
        let ll = l.split(",");
        return  !(
            ll[0] 
            && ll[1].trim() && !isNaN(Number(ll[1])) 
            && ll[2].trim() && !isNaN(Number(ll[2]))
        )
    })
    return !res
}
