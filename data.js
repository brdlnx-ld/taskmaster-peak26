export const SITES={LCY8:3,STN8:5,SXW2:3};
export const START='2026-11-18T18:00:00Z',END='2026-12-16T18:00:00Z';
export const ROUNDS=[
 {id:1,start:'2026-11-18T18:00:00Z',end:'2026-11-25T18:00:00Z',prize:'The Most Pointless Possession',prizeText:'Present the most spectacularly useless object you own. Explain why I should be grateful that it exists.',game:'The Tower of Absolute Nonsense',taskText:'Peccy chooses the objects for you. Build the tallest possible tower. Place the first piece, then time each DROP as the next object moves side to side. The objects arrive in a random order. Every object swings at a different speed; distractions may strike while you aim. The duck must be your final drop. Your tower must survive a ten-second wind test.'},
 {id:2,start:'2026-11-25T18:00:00Z',end:'2026-12-02T18:00:00Z',prize:'A Very Important Meeting',prizeText:'Stage the most important meeting in human history. No actual people may appear. Explain what is being discussed.',game:'The One-Line Wonder',taskText:'Draw the most terrifying potato imaginable. Draw freehand, anywhere on the page, using one continuous line before your ink runs out.'},
 {id:3,start:'2026-12-02T18:00:00Z',end:'2026-12-09T18:00:00Z',prize:"The World's Worst Gift",prizeText:'Find something you already own that would make the most disappointing Christmas gift imaginable. Explain who should receive it and why.',game:"Peccy's Terrible Invention",taskText:'Get the ball into the cup as quickly as possible, using as few gadgets as possible. You may not touch the ball once released. You have sixty seconds.'},
 {id:4,start:'2026-12-09T18:00:00Z',end:'2026-12-16T18:00:00Z',prize:'The Grand Coronation',prizeText:'Crown the least deserving ruler imaginable. Create a royal portrait worthy of its utterly unjustified reign.',game:"Peccy's Impossible Escape",taskText:'Escape Peccy’s locked room. You may inspect, tap or move anything. You have sixteen meaningful moves. Most ingenious escape wins. Your time starts now.'}
];
export const PRIZE_WEIGHT={originality:40,humour:40,compliance:20};
export const GAME_WEIGHT={objective:50,creativity:50};
export function championshipPoints(rank,completed=true){if(!completed)return 0;return rank>=1&&rank<=4?6-rank:1}
export function siteAverage(scores,capacity){return capacity?Math.round((scores.reduce((a,b)=>a+b,0)/capacity)*100)/100:0}
export function words(str){return (str.trim().match(/\S+/g)||[]).length}
export function chooseBest(attempts){return attempts.reduce((best,a)=>!best||a.total>best.total?a:best,null)}
