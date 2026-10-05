// Curated, fictional metadata for a controlled, entirely local demo corpus.
const asset = (id, image, title, cluster, details = {}) => ({
  id, image, title, cluster, src: `/photos/${id}.jpg`, type: 'photo', duration: '',
  date: '2026-08-16T10:30:00', year: 2026, location: 'Bengaluru', people: [],
  gender: '', ageGroup: '', scene: '', event: '', activity: [], objects: [],
  clothing: [], text: '', indoorOutdoor: 'outdoor', tags: [], ...details,
});

export const photos = [
  asset('sky-01','1470770841072-f978cf4d019e','A quiet morning by the lake','sky',{scene:'mountains lake cloudy mist',location:'Manali',event:'Himachal trip',tags:['sky','cloudy','mountains','mist','travel'],date:'2026-08-28T09:20:00'}),
  asset('girl-01','1517841905240-472988babdf9','An afternoon in the garden','girl',{gender:'female',ageGroup:'young adult',people:['Ananya'],scene:'garden smiling',event:'Sunday picnic',clothing:['casual'],tags:['girl','young','woman','smiling'],date:'2026-08-28T15:40:00'}),
  asset('sky-02','1500530855697-b586d89ba3ee','The road through the canyon','sky',{scene:'canyon blue sky clear',location:'Leh',event:'Road trip',tags:['sky','blue sky','travel','road'],date:'2026-08-28T18:30:00'}),
  asset('baby-01','1519689680058-324335c77eba','A tiny summer holiday','baby',{gender:'male',ageGroup:'infant',people:['Aarav'],scene:'pool',event:'Family afternoon',activity:['playing'],objects:['sunglasses'],tags:['baby','infant','family'],date:'2026-08-27T11:20:00'}),
  asset('sky-03','1464822759023-fed622ff2c3b','Blue skies over the peaks','sky',{scene:'mountains blue sky',location:'Manali',event:'Himachal trip',tags:['sky','mountains','blue sky','travel'],date:'2026-08-26T09:30:00'}),
  asset('travel-01','1507525428034-b723cf961d3e','The beach, all to ourselves','travel',{scene:'beach blue sky',location:'Goa',event:'Goa trip',tags:['sky','blue sky','beach','travel','sea'],date:'2026-08-26T14:30:00'}),
  asset('girl-02','1524504388940-b1c1722653e1','The light just before sunset','girl',{gender:'female',ageGroup:'young adult',people:['Meera'],scene:'outdoor portrait smiling',event:'Birthday',clothing:['casual'],tags:['girl','young','woman','smiling'],date:'2026-08-25T17:20:00'}),
  asset('wedding-01','1519741497674-611481863552','A day to remember','wedding',{gender:'female',ageGroup:'adult',people:['Meera','Arjun'],scene:'wedding ceremony bride',event:'Meera wedding',clothing:['traditional','white'],tags:['wedding','bride','marriage','ceremony','traditional','girl'],date:'2026-08-24T16:30:00'}),
  asset('art-01','1460661419201-fd4cecdf8a8b','A little colour for the weekend','art',{indoorOutdoor:'indoor',scene:'art painting',objects:['paint','brush','canvas'],activity:['drawing','painting'],tags:['drawing','art','painting'],date:'2026-08-24T10:30:00'}),
  asset('sky-04','1493246507139-91e8fad9978e','Sunset and still water','sky',{scene:'mountains lake sunset cloudy',location:'Manali',event:'Himachal trip',type:'video',duration:'0:18',tags:['sky','mountains','sunset','cloudy','travel','video'],date:'2026-08-22T18:10:00'}),
  asset('girl-03','1534528741775-53994a69daeb','A portrait by the window','girl',{gender:'female',ageGroup:'young adult',indoorOutdoor:'indoor',people:['Ananya'],scene:'portrait',event:'Family afternoon',clothing:['casual'],tags:['girl','woman','young'],date:'2026-08-21T13:40:00'}),
  asset('camera-01','1516035069371-29a1b244cc32','The camera came along too','camera',{indoorOutdoor:'indoor',scene:'camera',objects:['camera','DSLR'],tags:['camera','dslr','photography'],date:'2026-08-21T11:30:00'}),
  asset('sky-05','1470252649378-9c29740c9fa8','Sunrise in the valley','sky',{scene:'sunset mist landscape hills',location:'Coorg',event:'Coorg weekend',tags:['sky','sunset','mist','travel'],date:'2026-08-18T06:30:00'}),
  asset('girl-04','1488426862026-3ee34a7d66df','Coffee and a familiar smile','girl',{gender:'female',ageGroup:'adult',indoorOutdoor:'indoor',people:['Nisha'],scene:'portrait smiling',event:'Family afternoon',clothing:['casual'],tags:['girl','woman','smiling'],date:'2026-08-18T14:30:00'}),
  asset('baby-02','1503454537195-1dcabb73ffb9','A little explorer','baby',{gender:'female',ageGroup:'child',people:['Tara'],scene:'garden smiling',event:'Sunday picnic',activity:['playing'],tags:['baby','girl','child','young','family','playing','smiling'],date:'2026-08-15T16:30:00'}),
  asset('travel-02','1476514525535-07fb3b4ae5f1','A postcard from the mountains','travel',{scene:'mountains lake cloudy',location:'Manali',event:'Himachal trip',tags:['sky','mountains','cloudy','travel'],date:'2026-08-12T11:30:00'}),
  asset('sky-06','1441974231531-c6227db76b6e','Under the forest canopy','sky',{scene:'forest outdoor green',location:'Coorg',event:'Coorg weekend',type:'video',duration:'0:26',tags:['sky','outdoor','forest','travel','video'],date:'2026-08-10T10:30:00'}),
  asset('girl-05','1544005313-94ddf0286df2','At the family gathering','girl',{gender:'female',ageGroup:'adult',people:['Nisha'],scene:'portrait smiling',event:'Family gathering',clothing:['casual'],tags:['girl','woman','smiling'],date:'2026-07-28T12:30:00'}),
  asset('girl-06','1524250502761-1ac6f2e30d43','Out for a walk','girl',{gender:'female',ageGroup:'young adult',people:['Meera'],scene:'garden portrait',event:'Sunday picnic',activity:['walking'],clothing:['casual'],tags:['girl','woman','young'],date:'2026-07-26T16:30:00'}),
  asset('sky-07','1469474968028-56623f02e42e','The view from up here','sky',{scene:'mountains mist cloudy',location:'Manali',event:'Himachal trip',tags:['sky','mountains','cloudy','mist','travel'],date:'2026-07-24T09:30:00'}),
  asset('baby-03','1516627145497-ae6968895b74','An aspiring photographer','baby',{gender:'male',ageGroup:'toddler',indoorOutdoor:'indoor',people:['Aarav'],scene:'living room',event:'Family afternoon',activity:['playing'],objects:['toy','camera'],tags:['baby','toddler','child','young','family'],date:'2026-07-20T10:30:00'}),
  asset('sky-08','1500534623283-312aade485b7','The countryside in summer','sky',{scene:'landscape blue sky clear',location:'Coorg',event:'Coorg weekend',tags:['sky','blue sky','clear','travel'],date:'2026-07-18T14:30:00'}),
  asset('wedding-02','1511285560929-80b456fea0bc','The wedding garden','wedding',{scene:'wedding ceremony group photo evening',people:['Meera','Arjun','Nisha'],location:'Bengaluru',event:'Meera wedding',objects:['flowers','balloons'],tags:['wedding','ceremony','evening','group photo'],date:'2026-06-21T18:30:00'}),
  asset('baby-04','1544126592-807ade215a0b','Meeting the newest member','baby',{indoorOutdoor:'indoor',gender:'male',ageGroup:'infant',people:['Aarav','Nisha'],scene:'bedroom family',event:'Family afternoon',activity:['sleeping'],tags:['baby','infant','family'],date:'2026-06-18T12:30:00'}),
  asset('travel-03','1519046904884-53103b34b206','Our last evening in Goa','travel',{scene:'beach sunset',location:'Goa',event:'Goa trip',type:'video',duration:'0:32',tags:['sky','sunset','beach','travel','video'],date:'2026-06-12T18:30:00'}),
  asset('girl-07','1508214751196-bcfd4ca60f91','Everyone has a story','girl',{gender:'female',ageGroup:'adult',indoorOutdoor:'indoor',people:['Nisha'],scene:'portrait smiling',event:'Family gathering',clothing:['casual'],tags:['girl','woman','smiling'],date:'2026-05-22T12:30:00'}),
  asset('sky-09','1533104816931-20fa691ff6ca','Another kind of blue','sky',{scene:'blue sky ocean clear',location:'Goa',event:'Goa trip',tags:['sky','blue sky','beach','travel'],date:'2026-05-20T13:30:00'}),
  asset('wedding-04','1583939003579-730e3918a45a','Just married','wedding',{gender:'female',ageGroup:'young adult',people:['Meera','Arjun'],scene:'bride ceremony group photo',event:'Meera wedding',clothing:['traditional','white'],tags:['girl','young','bride','wedding','traditional','group photo'],date:'2026-06-21T16:30:00'}),
  asset('girl-08','1519457431-44ccd64a579b','A sunny afternoon together','girl',{gender:'female',ageGroup:'child',people:['Tara'],scene:'outdoor smiling',event:'Sunday picnic',activity:['playing'],clothing:['casual'],tags:['girl','young','child','smiling','family'],date:'2026-05-18T16:30:00'}),
  asset('baby-05','1537673156864-5d2c72de7824','A morning at home','baby',{indoorOutdoor:'indoor',gender:'male',ageGroup:'infant',people:['Aarav'],scene:'bedroom',event:'Family afternoon',activity:['playing'],tags:['baby','infant','family'],date:'2026-04-24T10:30:00'}),
  asset('camera-02','1502920917128-1aa500764cbd','Ready for our next trip','camera',{scene:'camera photography',objects:['camera','DSLR'],tags:['camera','dslr','photography','travel'],date:'2026-04-20T09:30:00'}),
  asset('baby-06','1471286174890-9c112ffca5b4','Running into the weekend','baby',{gender:'male',ageGroup:'child',people:['Aarav'],scene:'park',event:'Sunday picnic',activity:['walking','playing'],type:'video',duration:'0:14',tags:['baby','child','family','young','video'],date:'2026-03-28T11:30:00'}),
  asset('art-02','1513364776144-60967b0f800f','One page at a time','art',{indoorOutdoor:'indoor',scene:'art painting',objects:['paint','brush','canvas'],activity:['drawing','painting'],tags:['drawing','art','painting'],date:'2026-03-22T12:30:00'}),
  asset('wedding-05','1523438885200-e635ba2c371e','Ready for the ceremony','wedding',{scene:'wedding stage',event:'Meera wedding',objects:['stage','flowers'],tags:['wedding','ceremony','stage'],date:'2026-06-21T16:45:00'}),
  asset('girl-09','1551836022-d5d88e9218df','Getting everyone in the frame','girl',{gender:'female',ageGroup:'adult',indoorOutdoor:'indoor',people:['Meera','Nisha'],scene:'group photo',event:'Family gathering',clothing:['casual'],tags:['girl','woman','group photo','friends'],date:'2026-02-28T12:30:00'}),
  asset('sky-10','1418065460487-3e41a6c84dc5','A little mist on the trail','sky',{scene:'forest mist cloudy',location:'Coorg',event:'Coorg weekend',tags:['sky','mist','cloudy','travel'],date:'2026-02-22T08:30:00'}),
  asset('girl-10','1610030469983-98e550d6193c','Before the ceremony','girl',{gender:'female',ageGroup:'young adult',indoorOutdoor:'indoor',people:['Ananya'],scene:'portrait smiling',event:'Meera wedding',clothing:['traditional','red'],tags:['girl','young','woman','traditional','smiling','wedding'],date:'2026-06-21T14:30:00'}),
  asset('baby-bin','generated','Helping tidy up at home','baby',{src:'/photos/baby-bin.png',indoorOutdoor:'indoor',gender:'male',ageGroup:'toddler',people:['Aarav'],scene:'kitchen',event:'Family afternoon',activity:['walking','throwing','tidying'],objects:['bin','paper','dustbin'],type:'video',duration:'0:12',tags:['baby','toddler','child','brother','family','video'],date:'2025-11-08T11:30:00'}),
  asset('baby-07','1526634332515-d56c5fd16991','Discovering something new','baby',{gender:'male',ageGroup:'toddler',people:['Aarav'],scene:'living room',event:'Birthday',activity:['playing'],indoorOutdoor:'indoor',type:'video',duration:'0:22',tags:['baby','toddler','child','family','video'],date:'2025-12-24T10:30:00'}),
  ...[
    ['doc-01','Sample identity card','id card document text','2026-08-20T10:30:00'],
    ['doc-02','Travel booking','document text ticket','2026-08-10T10:30:00'],
    ['doc-03','A saved note','document text screenshot','2026-07-14T10:30:00'],
    ['doc-04','Sample membership card','id card document text','2025-08-18T10:30:00'],
    ['doc-05','Weekend itinerary','document text screenshot travel','2025-03-18T10:30:00'],
    ['doc-06','Sketchbook notes','document text drawing','2024-08-18T10:30:00'],
  ].map(([id,title,scene,date]) => asset(id,'local',title,'document',{src:`/photos/${id}.svg`,indoorOutdoor:'indoor',scene,date,year:Number(date.slice(0,4)),text:'DEMO SAMPLE — fictional information only',objects:['document',...(scene.includes('id card')?['id card']:[])],tags:scene.split(' ')})),
];

// Metadata dates and names are illustrative, not facts about the stock photographs.
photos.forEach(photo => { photo.year = Number(photo.date.slice(0,4)); });
export const people = [
  {name:'Ananya',src:'/photos/girl-01.jpg',query:'Ananya'},
  {name:'Meera',src:'/photos/girl-02.jpg',query:'Meera'},
  {name:'Aarav',src:'/photos/baby-03.jpg',query:'Aarav'},
  {name:'Nisha',src:'/photos/girl-05.jpg',query:'Nisha'},
  {name:'Tara',src:'/photos/girl-08.jpg',query:'Tara'},
];
export const memories = [
  {id:'august',title:'Best of August',subtitle:'A month worth remembering',src:'/photos/sky-01.jpg',query:'August'},
  {id:'scenes',title:'Featured scenes',subtitle:'2026',src:'/photos/travel-01.jpg',query:'travel'},
  {id:'weekend',title:'Weekend memories',subtitle:'The little things',src:'/photos/girl-02.jpg',query:'Sunday picnic'},
];
