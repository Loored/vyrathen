import type { Hero, SaveData } from '../engine/types.ts';

/** Equipos sintéticos para la demo; NO son personajes ni estadísticas recuperadas. */
export const PLAYER_TEAM: Hero[] = [
  {id:'h1',name:'Kael',type:'Energía',level:8,maxHp:360,maxMp:130,hit:75,block:55,dodge:52,mental:48,speed:72,power:'Fuego',powerLevel:5},
  {id:'h2',name:'Vesper',type:'Psico',level:7,maxHp:330,maxMp:155,hit:64,block:53,dodge:69,mental:82,speed:69,power:'Dar ordenes',powerLevel:4},
  {id:'h3',name:'Astra',type:'Defensa',level:9,maxHp:425,maxMp:115,hit:70,block:85,dodge:40,mental:65,speed:45,power:'Regeneracion',powerLevel:5},
  {id:'h4',name:'Nyra',type:'Control',level:8,maxHp:335,maxMp:140,hit:73,block:46,dodge:77,mental:68,speed:83,power:'Telequinesis',powerLevel:5},
  {id:'h5',name:'Volt',type:'Energía',level:7,maxHp:345,maxMp:145,hit:81,block:40,dodge:64,mental:51,speed:79,power:'Electricidad',powerLevel:4},
];
export const ENEMIES: Record<SaveData['selectedEnemy'], { label: string; subtitle: string; heroes: Hero[] }> = {
  patrulla: {label:'Patrulla oscura',subtitle:'Equipo de reconocimiento · Nivel 7–9',heroes:[
    {id:'e1',name:'Shard',type:'Control',level:8,maxHp:330,maxMp:130,hit:67,block:45,dodge:68,mental:66,speed:74,power:'Telequinesis',powerLevel:4},
    {id:'e2',name:'Sable',type:'Psico',level:7,maxHp:305,maxMp:160,hit:63,block:48,dodge:62,mental:79,speed:71,power:'Pesadilla',powerLevel:3},
    {id:'e3',name:'Grim',type:'Defensa',level:8,maxHp:405,maxMp:108,hit:72,block:77,dodge:47,mental:60,speed:49,power:'Invisibilidad',powerLevel:3},
    {id:'e4',name:'Ion',type:'Energía',level:9,maxHp:350,maxMp:155,hit:78,block:41,dodge:58,mental:57,speed:80,power:'Desatomizar',powerLevel:5},
    {id:'e5',name:'Rune',type:'Control',level:7,maxHp:320,maxMp:135,hit:71,block:48,dodge:68,mental:70,speed:75,power:'Parar el tiempo',powerLevel:4},
  ]},
  guardianes: {label:'Guardianes del nexo',subtitle:'Escuadrón blindado · Nivel 8–10',heroes:[
    {id:'g1',name:'Vox',type:'Psico',level:9,maxHp:370,maxMp:160,hit:73,block:55,dodge:56,mental:80,speed:69,power:'Oido agudo',powerLevel:5},
    {id:'g2',name:'Core',type:'Defensa',level:10,maxHp:460,maxMp:105,hit:77,block:90,dodge:41,mental:60,speed:47,power:'Escudo defensivo',powerLevel:5},
    {id:'g3',name:'Ash',type:'Energía',level:8,maxHp:360,maxMp:135,hit:74,block:45,dodge:67,mental:51,speed:77,power:'Fuego',powerLevel:5},
    {id:'g4',name:'Umbra',type:'Defensa',level:9,maxHp:412,maxMp:115,hit:75,block:82,dodge:46,mental:67,speed:54,power:'Curacion',powerLevel:4},
    {id:'g5',name:'Coda',type:'Control',level:9,maxHp:355,maxMp:145,hit:76,block:52,dodge:65,mental:72,speed:76,power:'Telequinesis',powerLevel:5},
  ]},
};
export const INITIAL_SAVE: SaveData = {
  version:1,laboratoryName:'Laboratorio Aurora',funds:2400000,turns:180,
  questProgress:0,questCompletions:0,selectedEnemy:'patrulla',seed:20100302,battles:0,
};
