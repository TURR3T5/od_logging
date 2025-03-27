import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Paper, Accordion, Group, Badge, Divider, TextInput, Tabs, List, Alert, Chip } from '@mantine/core';
import { MagnifyingGlass, Lightbulb, X, Info } from '@phosphor-icons/react';
import MainLayout from '../layouts/MainLayout';

interface Rule {
	id: string;
	badge: string;
	title: string;
	content: React.ReactNode;
	category: 'community' | 'roleplay';
	tags: string[];
	lastUpdated?: string;
}

export default function RulesPage() {
	const [activeCommunityRule, setActiveCommunityRule] = useState<string | null>(null);
	const [activeRoleplayRule, setActiveRoleplayRule] = useState<string | null>(null);
	const [scrollY, setScrollY] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredCommunityRules, setFilteredCommunityRules] = useState<Rule[]>([]);
	const [filteredRoleplayRules, setFilteredRoleplayRules] = useState<Rule[]>([]);
	const [activeTab, setActiveTab] = useState<string | null>('all');

	const communityRules: Rule[] = [
		{
			id: 'C1',
			badge: 'C1',
			title: 'Serverpersonale',
			content: <Text>Det er IKKE tilladt at kontakte serverpersonale i privatbeskeder uden forudgående accept! Brug support kanaler på Discord.</Text>,
			category: 'community',
			tags: ['support', 'staff', 'discord'],
			lastUpdated: '2025-03-10',
		},
		{
			id: 'C2',
			badge: 'C2',
			title: 'Reklame',
			content: <Text>Reklame og/eller links er IKKE tilladt. (@Content Kat er undtaget af denne regel)</Text>,
			category: 'community',
			tags: ['advertising', 'links'],
		},
		{
			id: 'C3',
			badge: 'C3',
			title: 'Chikane/racisme/mobning',
			content: <Text>Du skal tale/skrive pænt om vores brugere. OdessaRP tager stor afstand til chikane/racisme/mobning af vores spillere, samt opfordringer til dette uden for serveren.</Text>,
			category: 'community',
			tags: ['harassment', 'racism', 'bullying', 'behavior'],
		},
		{
			id: 'C4',
			badge: 'C4',
			title: 'Voksent Community',
			content: <Text>Det er IKKE tilladt at være provokerende uden grund over for andre spillere, dette kan medføre ban, vi ønsker en god tone og et voksent community! Det er IKKE tilladt at promovere hasardspil på nogle måde, dette glæder også skærmdeling af diverse sider.</Text>,
			category: 'community',
			tags: ['behavior', 'gambling', 'community'],
		},
		{
			id: 'C5',
			badge: 'C5',
			title: 'Supportsager',
			content: <Text>Du må ikke blande dig i andres admin-/supportsager</Text>,
			category: 'community',
			tags: ['support', 'admin'],
		},
		{
			id: 'C6',
			badge: 'C6',
			title: 'Personlig Profil',
			content: <Text>Din bruger hos OdessaRP er personlig og må ikke udleveres eller udlånes til anden part (eller tredje part)</Text>,
			category: 'community',
			tags: ['account', 'security'],
		},
		{
			id: 'C7',
			badge: 'C7',
			title: 'Følgende informationer gemmes',
			content: (
				<>
					<Text>Så snart du joiner OdessaRP, skal du være opmærksom på følgende ting bliver registeret og gemt:</Text>
					<Text ml='md'>- Dit steam ID.</Text>
					<Text ml='md'>- Din FiveM licensnøgle.</Text>
					<Text ml='md'>- Dit Discord ID og account ID.</Text>
					<Text ml='md'>- Din IP-adresse.</Text>
					<Text ml='md'>- Hardware ID.</Text>
					<Text mt='xs'>Hvis du har lavet noget strafbart på serveren, som går imod dansk lovgivning, vil disse oplysninger blive overdraget til politiet. Når du vælger at spille på OdessaRP, accepterer du disse sanktionsmuligheder.</Text>
				</>
			),
			category: 'community',
			tags: ['data', 'privacy', 'information'],
		},
		{
			id: 'C8',
			badge: 'C8',
			title: 'Mikrofon og Voice Changer',
			content: <Text>Du skal have en god mikrofon for at spille på vores servere. Voice-changer kan i specifikke tilfælde tillades, hvis det er godkendt i forbindelse med allowlist samtalen, eller hvis der ansøges om det inden RP-scenarier.</Text>,
			category: 'community',
			tags: ['microphone', 'voice', 'equipment'],
		},
		{
			id: 'C9',
			badge: 'C9',
			title: 'Reglbrud',
			content: <Text>Husk altid at have et bevis og spiller-ID [HOME KNAPPEN], hvis du vil anklage en anden spiller for brud på reglerne. Husk også at lave en /report på den spiller du ønsker at anklage.</Text>,
			category: 'community',
			tags: ['rules', 'evidence', 'report'],
		},
		{
			id: 'C10',
			badge: 'C10',
			title: 'Optager Program',
			content: <Text>Vi anbefaler brug af medal.tv, ShadowPlay, OBS, Gecata, XSplit, eller lignende. OBS: Video der ikke er fyldestgørende ved f.eks at mangle lyd, eller være klippet så staff ikke kan få det fulde billede, risikerer at blive afvist som gyldigt bevismateriale i supportsager.</Text>,
			category: 'community',
			tags: ['recording', 'evidence', 'software'],
		},
		{
			id: 'C11',
			badge: 'C11',
			title: 'Genstart / Crash',
			content: <Text>Du må ikke bruge server genstart/crashes som en mulighed for at flygte fra en RP-situation fra tidligere. Du skal vente på involverede personer og fortsætte dit RP.</Text>,
			category: 'community',
			tags: ['restart', 'crash', 'roleplay'],
		},
		{
			id: 'C12',
			badge: 'C12',
			title: 'Combatlog',
			content: <Text>Det er ikke tilladt at combatlogge, altså at logge ud for at slippe ud af et RP-scenarie.</Text>,
			category: 'community',
			tags: ['combatlog', 'logout', 'roleplay'],
		},
		{
			id: 'C13',
			badge: 'C13',
			title: 'Backseat Moderating',
			content: <Text>Backseat moderating er ikke tilladt. Du må ikke udgive dig for at være staff osv.</Text>,
			category: 'community',
			tags: ['moderating', 'staff', 'impersonation'],
		},
		{
			id: 'C14',
			badge: 'C14',
			title: 'Discord',
			content: <Text>Hvis du forlader Odessa's Discord, skal du til ny allowlist samtale, for at få adgang til serveren igen.</Text>,
			category: 'community',
			tags: ['discord', 'allowlist'],
		},
		{
			id: 'C15',
			badge: 'C15',
			title: 'OOC',
			content: <Text>De eneste personer, der må bryde karakter (OOC), er staff i forbindelse med support.</Text>,
			category: 'community',
			tags: ['ooc', 'character', 'roleplay'],
		},
		{
			id: 'C16',
			badge: 'C16',
			title: 'Færdiggør scenarie trods reglbrud',
			content: <Text>Opstår der uenighed omkring udførslen af et RP-scenarie, skal der altid bestræbes på at fuldføre scenariet efter gældende RP-regler, derefter kan man gå i support med dertilhørende beviser for den uhensigtsmæssige udførsel. Bryd under ingen omstændigheder din karakter i hverken OOC-chat eller via voice-kommunikation.</Text>,
			category: 'community',
			tags: ['roleplay', 'scenario', 'conflict'],
		},
		{
			id: 'C17',
			badge: 'C17',
			title: 'Support',
			content: <Text>Alle supportsager skal tages på Discord i samarbejde med en fra staff. (HUSK VIDEO OG ID)</Text>,
			category: 'community',
			tags: ['support', 'discord', 'staff'],
		},
		{
			id: 'C18',
			badge: 'C18',
			title: 'Ingame Problemer',
			content: <Text>Hvis du oplever in-game-problemer (eksempelvis at sidde fast under jorden) Kontakt support.</Text>,
			category: 'community',
			tags: ['issues', 'bugs', 'support'],
		},
		{
			id: 'C19',
			badge: 'C19',
			title: 'Radio',
			content: <Text>OdessaRP's ingame radioer er de eneste godkendte radioer. Andre 3.-parts taleprogrammer er ikke tilladte at bruge, så længe du er in-game.</Text>,
			category: 'community',
			tags: ['radio', 'communication', 'third-party'],
		},
		{
			id: 'C20',
			badge: 'C20',
			title: 'Hacking, Exploiting, Modding',
			content: (
				<>
					<Text>Det er givetvis ikke tilladt at hacke, exploite, modde eller på anden måde snyde. Dette resulterer i permanent ban uden varsel.</Text>
					<Text mt='xs'>Eksempler på dette kan være følgende:</Text>
					<Text ml='md'>- Stretching</Text>
					<Text ml='md'>- Mods der giver visuelle fordele (fx. ændring i field of view - brug af no night - brug af pvp graphic mods)</Text>
					<Text ml='md'>- Kill Effects</Text>
					<Text ml='md'>- Flawless Widescreen</Text>
					<Text ml='md'>- Diverse skins (F.eks skins der ændre våbnets farve til andet end Sort/Grå, eller ændre deres model, så de får indbygget sigte eller tilføjet andre visuelle konfigurationer.)</Text>
					<Text mt='xs'>Er man i tvivl omkring ovenstående, og har man en funktion, som måske kan høre under ovenstående. Så kontakt en staff, og få bekræftelse inden det tages i brug på serveren!</Text>
					<Text mt='xs'>Derved accepterer du også følgende TOS https://fini.ac/page/servers/terms-of-service når du spiller på OdessaRP. Det er altid spillerens eget ansvar, at sikre man spiller i overensstemmelse med Odessas regelsæt & TOS.</Text>
				</>
			),
			category: 'community',
			tags: ['hacking', 'exploiting', 'modding', 'cheating'],
		},
		{
			id: 'C21',
			badge: 'C21',
			title: 'Bugs og Misbrug',
			content: <Text>Finder man bugs, SKAL disse indberettes til staff øjeblikkeligt. Misbruger man disse, resulterer det i permanent ban uden varsel.</Text>,
			category: 'community',
			tags: ['bugs', 'abuse', 'reporting'],
		},
		{
			id: 'C22',
			badge: 'C22',
			title: 'Transfer Items',
			content: <Text>Det er ikke tilladt at 'transfer' items, penge, biler etc. i mellem dine personlige karakterer.</Text>,
			category: 'community',
			tags: ['items', 'transfer', 'characters'],
		},
		{
			id: 'C23',
			badge: 'C23',
			title: 'Snyd ved bilsalg',
			content: <Text>Det er ikke tilladt at snyde ved salg/køb af bil hos brugtvogns forhandleren.</Text>,
			category: 'community',
			tags: ['car', 'sales', 'dealership'],
		},
		{
			id: 'C24',
			badge: 'C24',
			title: 'Emotes ved handlinger',
			content: <Text>Du skal bruge handlinger, som passer bedst til den situation du står i, for at forbedre RP'en. Handlinger foretages ikke i køretøjer!</Text>,
			category: 'community',
			tags: ['emotes', 'actions', 'roleplay'],
		},
		{
			id: 'C25',
			badge: 'C25',
			title: 'Handel med rigtige penge',
			content: <Text>Det er på ingen måde tilladt at handle med rigtige penge (eller andre ting af værdi) om ting inde i spillet. Dette strider også imod FiveM's egne Terms of Service. Opdages dette, vil det resultere i permanent ban.</Text>,
			category: 'community',
			tags: ['real money', 'trading', 'ban'],
		},
		{
			id: 'C26',
			badge: 'C26',
			title: 'Kommune Udstyr',
			content: <Text>Man må ikke loote kommune udstyr. Det vil sige, at man under ingen omstændigheder må stjæle/være i besiddelse af Politi/Brand & Redning's udstyr, såsom tazer/politi stav/AssaultRifle/Tjeneste Pistol/Medkits osv.</Text>,
			category: 'community',
			tags: ['equipment', 'police', 'medical'],
		},
		{
			id: 'C27',
			badge: 'C27',
			title: 'Våbenlicens',
			content: <Text>En våben licens giver adgang til en musket hos våbenhandleren, Det er udelukkende tilladt at bruge denne musket til jagt! Bruges den til personfarligt RP, vil det medfører en advarsel.</Text>,
			category: 'community',
			tags: ['weapons', 'license', 'hunting'],
		},
		{
			id: 'C28',
			badge: 'C28',
			title: 'Karakter CK/PK',
			content: (
				<>
					<Text>PK: Dette betyder din karakter dør, men værdier overføres til en evt. ny karakter. (penge,biler osv) (Du kan IKKE PK din egen karakter)</Text>
					<Text>CK: Dette betyder din karakter dør, alt slettes (penge,biler osv) (selvmord kan til enhver tid vurderes som CK af staff)</Text>
				</>
			),
			category: 'community',
			tags: ['character', 'death', 'permadeath'],
		},
		{
			id: 'C29',
			badge: 'C29',
			title: 'Ansøgning om PK',
			content: <Text>Ønsker du en anden spiller PK'et, skal du oprette en CK/PK ansøgning. Her fremlægger du en velskrevet tekst samt begrundelse, for det ønskede PK. Scenariet kan først udføres når ansøgningen er godkendt.</Text>,
			category: 'community',
			tags: ['permakill', 'application', 'scenario'],
		},
		{
			id: 'C30',
			badge: 'C30',
			title: 'Suicide By Cop',
			content: <Text>Hvis du bevidst lader dig blive dræbt af politiet (Suicide by Cop), eller begår selvmord for at undgå en straf, vil dette medføre et CK.</Text>,
			category: 'community',
			tags: ['suicide', 'cop', 'punishment'],
		},
		{
			id: 'C31',
			badge: 'C31',
			title: 'Karakter Navn',
			content: <Text>Dit Karakternavn SKAL stå her på Discord, så staff nemt kan identificere dig. Du behøver ikke skrive navnet på alle dine karaktere, men bare din main karakter.</Text>,
			category: 'community',
			tags: ['character', 'name', 'discord'],
		},
		{
			id: 'C32',
			badge: 'C32',
			title: 'Gambling',
			content: <Text>Det er ikke tilladt at streame gambling på Odessas Discord.</Text>,
			category: 'community',
			tags: ['gambling', 'streaming', 'discord'],
		},
	];

	const roleplayRules: Rule[] = [
		{
			id: '1',
			badge: '§1',
			title: 'RDM (Random DeathMatch)',
			content: <Text>Hvis der ikke er noget RP-scenarie, som retfærdiggør, at man slår/skyder/stikker eller på anden måde laver en handling der resulterer i en anden spillers død.</Text>,
			category: 'roleplay',
			tags: ['death', 'killing', 'violence'],
			lastUpdated: '2025-03-15',
		},
		{
			id: '2',
			badge: '§2',
			title: 'VDM (Vehicle DeathMatch)',
			content: <Text>Du må ikke bruge dit køretøj som våben, også selvom du ikke dræber personen. Derfor kører du ikke ind i et stillestående køretøj. Hvis man skal pitte en bil, skal det gøres så realistisk som muligt.</Text>,
			category: 'roleplay',
			tags: ['vehicle', 'car', 'death', 'killing'],
		},
		{
			id: '3',
			badge: '§3',
			title: 'COPBAIT',
			content: <Text>Copbait er IKKE tilladt. Der skal være en grund til at flygte fra politiet. Det er eksempelvis ikke god nok grund til at flygte, hvis du blot har kørt over for rødt lys.</Text>,
			category: 'roleplay',
			tags: ['police', 'chase', 'behavior'],
		},
		{
			id: '4',
			badge: '§4',
			title: 'FAIL RP',
			content: (
				<>
					<Text>Udfører din karakter en handling, som i situationen ikke giver mening for din karakterer. Så kan det anses som værende FailRP.</Text>
					<Text mt='xs'>Eksempel 1: Du opsøger politiet kort efter at du har været på flugt fra selvsamme politi.</Text>
					<Text mt='xs'>Eksempel 2: To spillere står med en igangværende RP samtale. I denne situation vil det være en forkert handling, at involvere sig i samtalen for udelukkende at handle destruktivt uden RP grundlag.</Text>
				</>
			),
			category: 'roleplay',
			tags: ['fail', 'roleplay', 'behavior'],
		},
		{
			id: '5',
			badge: '§5',
			title: 'POWER GAMING',
			content: (
				<>
					<Text>§5.1 Powergaming er ikke tilladt og dækker enhver urealistisk handling, der manipulerer spillets begrænsninger for egen fordel. Eksempler inkluderer at køre off-road i en lav sportsvogn, hoppe ud over en bro og straks kunne løbe væk, efter at man kun lige har overlevet faldet.</Text>
					<Text mt='md'>§5.2 Denne regel gælder også brug af køretøjer: Hvis man kører direkte ind i en væg eller falder mere end 20 meter, skal dette afspejles realistisk i ens spil. Kører man sit køretøj i vandet for at flygte fra et scenarie vil dette ligeledes blive betragtet som powergaming og kan, efter vurdering af staff, resultere i, at køretøjet slettes permanent.</Text>
					<Text mt='md'>(Bemærk, at brug af stuntjumps på Odessa stadig er tilladt.)</Text>
					<Text mt='md'>Andre former for powergaming inkluderer at ignorere effekten af flere tazerskud (3-5 stykker) samt at udføre spark/slag fra en motorcykel, hvilket også anses som powergaming.</Text>
					<Text mt='md'>Brud på denne regel vil, som ved alle regler, blive håndhævet af staff.</Text>
				</>
			),
			category: 'roleplay',
			tags: ['powergaming', 'realistic', 'advantage'],
		},
		{
			id: '6',
			badge: '§6',
			title: 'NLR',
			content: <Text>Overhold altid NLR (New Life Rule). Du kan ikke huske hvad der lige er sket, hvis din karakter har været slået bevidstløs uden at blive genoplivet. Bliver man genoplivet, så kan man godt huske det foregående scenarie. Husk at en genoplivning skal være på sin plads. Bliver man for eksempel skudt i hovedet, så kan man selvfølgelig ikke blive genoplivet. Der skal være grundlag for at fortsætte scenariet efter en genoplivning. Flere genoplivninger (to eller flere genoplivninger) i samme scenarie, kan blive betragtet som Hævn RP, og kan udløse en advarsel.</Text>,
			category: 'roleplay',
			tags: ['newlife', 'death', 'memory'],
		},
		{
			id: '7',
			badge: '§7',
			title: 'METAGAMING',
			content: (
				<>
					<Text>Metagaming er forbudt: Du må ikke bruge viden, som din karakter ikke har fået igennem spillet, til at påvirke dine handlinger ingame.</Text>
					<Text mt='xs'>Det er ikke tilladt at dele din karakters tanker via en /me-kommando.</Text>
					<Text mt='xs'>Det er ikke tilladt at lyve i en /me-kommando.</Text>
					<Text mt='xs'>Dine karakterer må ikke have nogen form for kendskab til hinanden eller være i familie med hinanden.</Text>
				</>
			),
			category: 'roleplay',
			tags: ['metagaming', 'knowledge', 'characters'],
		},
		{
			id: '8',
			badge: '§8',
			title: 'FearRP',
			content: (
				<>
					<Text>På odessa har vi følgende våben rangering, hvor 1 er højeste rangering, og 3 er laveste:</Text>
					<Text ml='md'>1: Skydevåben (fx. pistol, smg og shotgun)</Text>
					<Text ml='md'>2: Slag og stikvåben (fx. bat eller kniv)</Text>
					<Text ml='md'>3: knytnæver</Text>

					<Text mt='md'>Hvis du bliver truet af en anden spiller, skal du overveje følgende før du tager handling:</Text>

					<Text mt='xs'>A: Har personen en højere våbenrangering end dig, og står inden for kort afstand til dig? (Kan de ramme dig med våbnet, eller kan de let komme til det)</Text>
					<Text ml='md'>Hvis ja: Skal du overgive dig.</Text>

					<Text mt='xs'>B: Har personen en højere våbenrangering end dig, men står et stykke væk fra dig? (Langt nok væk til du føler, at du har en chance for at overleve, ved at flygte)</Text>
					<Text ml='md'>Hvis ja: Må du overgive dig eller flygte.</Text>

					<Text mt='xs'>C: Har du samme våben som modparten i hånden?</Text>
					<Text ml='md'>Hvis ja: Må du flygte, kæmpe eller overgive dig.</Text>

					<Text mt='md'>Hvis man bliver gunpointet, kan man løbe fra stedet og må kun trække sit våben, hvis man er langt nok væk fra den, der har gunpoint på dig. At løbe i cirkler omkring truslen, for at trække våben er ikke tilladt.</Text>
					<Text>En god tommelfingerregel er at man er ude af syne og længere væk end regel a og b, før man må trække våben og gøre brug af regel C.</Text>

					<Text mt='md'>Jvf. regel A og B, så kan du kun vælge at kæmpe for dit liv, hvis du har en reel mulighed for at kæmpe tilbage. Det har du ikke, hvis du står foran en person med trukket våben, og du er ubevæbnet eller ikke har trukket våben.</Text>

					<Text mt='md'>Bemærk: Staff teamet kan vurdere situationer og gribe ind, hvis reglerne bliver brudt.</Text>
				</>
			),
			category: 'roleplay',
			tags: ['fear', 'weapons', 'threat'],
			lastUpdated: '2025-03-15',
		},
		{
			id: '9',
			badge: '§9',
			title: 'OOC (Out Of Character)',
			content: (
				<>
					<Text>Det er strengt forbudt at bryde sin karakter. Bryder du din karakter, kan du blive udelukket, da dette ødelægger RP-scenarier. En Staff kan altid vurdere om noget er OOC snak.</Text>

					<Text mt='md'>Eksempler på, hvad vi betragter som OOC:</Text>
					<Text ml='md'>"Jeg skal lige noget i hovedet" / "Jeg har noget i lejligheden"</Text>
					<Text ml='md'>"Det var en nervefejl" / "Hvilken nerve skal jeg bruge"</Text>
					<Text ml='md'>"Hov, lige to sekunder"</Text>
					<Text ml='md'>"Jeg skal lige i kommunen" / "Jeg spiser lige Suppe"</Text>
					<Text ml='md'>"Vindermentalitet"</Text>

					<Text mt='md'>Staff kan i tilfælde af support give tilladelse til at snakke OOC.</Text>
				</>
			),
			category: 'roleplay',
			tags: ['ooc', 'character', 'breaking'],
		},
		{
			id: '10',
			badge: '§10',
			title: 'Voldtægt',
			content: <Text>Voldtægts-RP er ikke tilladt.</Text>,
			category: 'roleplay',
			tags: ['rape', 'prohibited'],
		},
		{
			id: '11',
			badge: '§11',
			title: 'Røveri/Tyveri',
			content: (
				<>
					<Text>Det er IKKE tilladt at røve en anden spiller for egen økonomisk vinding (kedsomhed), eller uden foregående RP, (Det er dog kun tilladt at røve personen for værdier, de har på sig. Det er eksempelvis ikke tilladt at tvinge en person til at overdrage en bil eller værdier, de ikke har på sig).</Text>
					<Text mt='xs'>Det er IKKE tilladt at stjæle køretøjer og tømme dem for materialer/våben osv., for egen økonomisk vinding (kedsomhed), eller uden foregående RP.</Text>
					<Text mt='xs'>Det er IKKE tilladt at stjæle Kommune udstyr (politi/læge med mere) F.eks. Våben, ammunition, håndjern, tazer, Piller, medkits osv.</Text>
					<Text mt='xs'>OBS! Ved gyldigt RP grundlag er det tilladt at stjæle tjeneste køretøjer.</Text>
				</>
			),
			category: 'roleplay',
			tags: ['robbery', 'theft', 'vehicle'],
		},
		{
			id: '12',
			badge: '§12',
			title: 'Bander',
			content: (
				<>
					<Text>Civile må ikke agere bande (tøj/biler/forsamlinger i ens farvet tøj).</Text>
					<Text mt='xs'>Bander skal godkendes (ansøgning/historie/bande start).</Text>
					<Text mt='xs'>Som bandemedlem, skal man tage et videoklip hver gang man slår en spiller ihjel. Grund: Man kan fremvise man har rent mel i posen, i forhold til eventuelle supportsager, omkring sigtekorn, visuelle fordele, RDM, eller andet. Disse klip skal gemmes i 24 timer, derefter kan de slettes.</Text>
					<Text mt='xs'>(irl bandenavne accepteres ikke på Odessa & det er kun tilladt at have 1 bandekarakter)</Text>
				</>
			),
			category: 'roleplay',
			tags: ['gang', 'approval', 'video'],
		},
		{
			id: '13',
			badge: '§13',
			title: 'Politi',
			content: <Text>Politiet må under ingen omstændigheder tage udstyr fra lagre mv. hverken for økonomisk vinding eller dele det ud.</Text>,
			category: 'roleplay',
			tags: ['police', 'equipment', 'storage'],
		},
		{
			id: '14',
			badge: '§14',
			title: 'Bank & Butiksrøverier',
			content: (
				<>
					<Text>Røverier skal planlægges grundigt. Det er ikke tilladt at udføre serie røverier. Hvis et røveri påbegyndes, skal det færdiggøres, og man må ikke forlade området uden at fuldføre det.</Text>
					<Text mt='xs'>Det er tilladt at tage gidsler, så længe de inddrages aktivt i scenariet.</Text>
					<Text mt='xs'>Der må ikke skydes, før der har været forsøg på forhandlinger.</Text>
				</>
			),
			category: 'roleplay',
			tags: ['robbery', 'bank', 'store'],
		},
		{
			id: '15',
			badge: '§15',
			title: 'Regler for KOS',
			content: (
				<>
					<Text>KOS betydningen er som følgende Kill On Site 🔫</Text>
					<Text mt='md'>👉 KOS er tilegnet udelukkende for bander og dets medlemmer 🔪</Text>
					<Text mt='md'>Perico Island har fået sit eget regelsæt på serveren, for og undgå konflikter lyder de som følgende 📓</Text>
					<Text mt='xs'>1) Alt trafik og befærden på øen er på eget ansvar.</Text>
					<Text ml='md'>1A) Alle mistede genstande på øen indenfor zonen vil ikke blive refunderet, eftersom øen er på eget ansvar, og man bliver gjort opmærksom på dette ved ankomst til zonen.</Text>
					<Text ml='md'>1B) I nogle tilfælde kan en refund/support godt laves hvis der har været tale om fejl.</Text>

					<Text mt='xs'>2) Politiet og lægerne har ingen aftale i dette distrikt, og vil ej komme i dette område.</Text>
					<Text ml='md'>2A) Politiets regler gælder ikke på øen, og ordensmagtens sigtelser er ej heller gyldige for dette område. (Indsamling af beviser eller andet må godt finde sted af ordensmagten med henblik på sagsbearbejdning)</Text>
					<Text ml='md'>2B) Lægerne får ingen opkald, og rykker ikke ud til øen, spillere skal selv hjælpe deres venner eller bande væk.</Text>

					<Text mt='xs'>3) Indenfor markeret område vil man automatisk smide alle sine ting på jorden, og alt kan tages op af en anden spiller, om det er bande eller om det er en rival.</Text>

					<Text mt='xs'>4) RDM og Loot regler gælder ikke i zonen på øen, og bliver derfor tilsidesat ved indtræden i zonen på øen. (alle mod alle - bande mod bande)</Text>
				</>
			),
			category: 'roleplay',
			tags: ['kos', 'kill', 'perico'],
		},
	];

	// Quick Rules Summary
	const quickRulesSummary = ['Kontakt staff KUN via support kanaler, aldrig DMs', 'RDM/VDM er ikke tilladt - vold kræver RP-begrundelse', 'Fear RP skal respekteres - følg våbenrangeringen', 'OOC (Out Of Character) er strengt forbudt', 'Voldtægts-RP er ikke tilladt', 'Hold dine karakterer adskilt - ingen deling af ejendele', 'Handel med rigtige penge er strengt forbudt', 'Kommune udstyr (politi/brandvæsen) må ikke lootes'];

	// Update scroll position for parallax effect
	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	// Filter rules based on search query
	useEffect(() => {
		if (searchQuery.trim() === '') {
			setFilteredCommunityRules(communityRules);
			setFilteredRoleplayRules(roleplayRules);
		} else {
			const lowerCaseQuery = searchQuery.toLowerCase();

			setFilteredCommunityRules(communityRules.filter((rule) => rule.title.toLowerCase().includes(lowerCaseQuery) || (typeof rule.content === 'string' && rule.content.toLowerCase().includes(lowerCaseQuery)) || rule.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) || rule.badge.toLowerCase().includes(lowerCaseQuery)));

			setFilteredRoleplayRules(roleplayRules.filter((rule) => rule.title.toLowerCase().includes(lowerCaseQuery) || (typeof rule.content === 'string' && rule.content.toLowerCase().includes(lowerCaseQuery)) || rule.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) || rule.badge.toLowerCase().includes(lowerCaseQuery)));
		}
	}, [searchQuery]);

	// Filter by tab
	const displayCommunityRules = activeTab === 'all' || activeTab === 'community';
	const displayRoleplayRules = activeTab === 'all' || activeTab === 'roleplay';

	return (
		<MainLayout requireAuth={false}>
			<Box
				style={{
					position: 'relative',
					minHeight: '100vh',
					overflow: 'hidden',
				}}
			>
				{/* Animated background */}
				<Box
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundImage: 'linear-gradient(135deg, #111111 25%, #1a1a1a 25%, #1a1a1a 50%, #111111 50%, #111111 75%, #1a1a1a 75%, #1a1a1a 100%)',
						backgroundSize: '40px 40px',
						opacity: 0.5,
						transform: `translateY(${scrollY * 0.1}px)`,
						pointerEvents: 'none',
						zIndex: 0,
					}}
				/>

				{/* Animated gradient overlay */}
				<Box
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'radial-gradient(circle at 50% 50%, rgba(13, 13, 13, 0.7) 0%, rgba(10, 10, 10, 0.9) 70%, rgba(8, 8, 8, 0.95) 100%)',
						pointerEvents: 'none',
						zIndex: 0,
					}}
				/>

				{/* Content */}
				<Container size='lg' py='xl' style={{ position: 'relative', zIndex: 1 }}>
					<Paper
						withBorder
						p='xl'
						radius='md'
						mb='xl'
						style={{
							background: 'rgba(25, 25, 25, 0.95)',
							backdropFilter: 'blur(10px)',
							borderColor: '#333',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
						}}
					>
						<Box
							style={{
								background: 'linear-gradient(to right, rgba(225, 29, 72, 0.1), rgba(225, 29, 72, 0.02))',
								padding: '16px',
								borderRadius: '8px',
								marginBottom: '24px',
								borderLeft: '4px solid #e11d48',
							}}
						>
							<Badge color='red' size='lg' radius='sm' mb='md'>
								VIGTIGT
							</Badge>
							<Text size='lg' fw={700} c='red.4'>
								DET ER ENHVER SPILLERS EGET ANSVAR AT HOLDE SIG OPDATERET PÅ ODESSA'S REGELSÆT - NYE/ÆNDREDE REGLER VIL ALTID BLIVE MELDT UD I DISCORD
							</Text>
						</Box>

						<Title order={1} mb='lg' c='gray.3' fw={800} ta='center'>
							OdessaRP Regelsæt
						</Title>

						{/* Search and Filter */}
						<Box mb='xl'>
							<Group justify='space-between' mb='md'>
								<TextInput leftSection={<MagnifyingGlass size={18} />} placeholder='Søg efter regler...' value={searchQuery} onChange={(event) => setSearchQuery(event.currentTarget.value)} style={{ flexGrow: 1 }} rightSection={searchQuery ? <X size={16} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} /> : null} />
							</Group>

							<Tabs value={activeTab} onChange={setActiveTab}>
								<Tabs.List>
									<Tabs.Tab value='all'>Alle Regler</Tabs.Tab>
									<Tabs.Tab value='community'>Discord & Community Regler</Tabs.Tab>
									<Tabs.Tab value='roleplay'>Rollespils Regler</Tabs.Tab>
								</Tabs.List>
							</Tabs>
						</Box>

						{/* Quick Rules Summary */}
						<Paper withBorder p='md' radius='md' mb='xl' style={{ backgroundColor: 'rgba(30, 30, 30, 0.6)' }}>
							<Group mb='sm'>
								<Lightbulb size={24} color='#FFD700' />
								<Title order={4}>Hurtigt Overblik - Vigtigste Regler</Title>
							</Group>
							<List spacing='xs' size='sm'>
								{quickRulesSummary.map((rule, index) => (
									<List.Item key={index}>{rule}</List.Item>
								))}
							</List>
						</Paper>

						{/* Recently Updated Rules Alert */}
						<Alert icon={<Info size={24} />} title='Nyligt Opdaterede Regler' color='blue' mb='xl' variant='outline'>
							<Text size='sm' mb='xs'>
								Følgende regler er blevet opdateret inden for de sidste 30 dage:
							</Text>
							<Group>
								<Chip checked={false}>C1: Serverpersonale</Chip>
								<Chip checked={false}>§1: RDM</Chip>
								<Chip checked={false}>§8: FearRP</Chip>
							</Group>
						</Alert>

						{/* Community Guidelines Section */}
						{displayCommunityRules && (
							<Box mb='xl'>
								<Title
									order={3}
									mb='md'
									style={{
										display: 'inline-block',
										padding: '10px 20px',
										background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
										borderRadius: '8px',
										borderLeft: '4px solid #3b82f6',
										fontWeight: 700,
									}}
								>
									DISCORD & COMMUNITY GUIDELINES
								</Title>

								<Accordion value={activeCommunityRule} onChange={setActiveCommunityRule} radius='md' variant='filled'>
									{filteredCommunityRules.length > 0 ? (
										filteredCommunityRules.map((rule) => (
											<Accordion.Item value={rule.id} key={rule.id}>
												<Accordion.Control>
													<Group>
														<Badge color='blue' size='lg'>
															{rule.badge}
														</Badge>
														<Text fw={500}>{rule.title}</Text>
														{rule.lastUpdated && (
															<Badge color='cyan' size='sm' variant='light'>
																Opdateret
															</Badge>
														)}
													</Group>
												</Accordion.Control>
												<Accordion.Panel>{rule.content}</Accordion.Panel>
											</Accordion.Item>
										))
									) : (
										<Text ta='center' fs='italic' py='md'>
											Ingen regler matcher din søgning
										</Text>
									)}
								</Accordion>
							</Box>
						)}

						{displayCommunityRules && displayRoleplayRules && (
							<Divider
								my='xl'
								style={{
									position: 'relative',
									overflow: 'visible',
								}}
								label={
									<Badge size='lg' radius='sm' variant='light'>
										OdessaRP
									</Badge>
								}
								labelPosition='center'
							/>
						)}

						{/* Roleplay Rules Section */}
						{displayRoleplayRules && (
							<Box>
								<Title
									order={3}
									mb='md'
									style={{
										display: 'inline-block',
										padding: '10px 20px',
										background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))',
										borderRadius: '8px',
										borderLeft: '4px solid #22c55e',
										fontWeight: 700,
									}}
								>
									ROLLESPILS REGLER
								</Title>

								<Accordion value={activeRoleplayRule} onChange={setActiveRoleplayRule} radius='md' variant='filled'>
									{filteredRoleplayRules.length > 0 ? (
										filteredRoleplayRules.map((rule) => (
											<Accordion.Item value={rule.id} key={rule.id}>
												<Accordion.Control>
													<Group>
														<Badge color='green' size='lg'>
															{rule.badge}
														</Badge>
														<Text fw={500}>{rule.title}</Text>
														{rule.lastUpdated && (
															<Badge color='cyan' size='sm' variant='light'>
																Opdateret
															</Badge>
														)}
													</Group>
												</Accordion.Control>
												<Accordion.Panel>{rule.content}</Accordion.Panel>
											</Accordion.Item>
										))
									) : (
										<Text ta='center' fs='italic' py='md'>
											Ingen regler matcher din søgning
										</Text>
									)}
								</Accordion>
							</Box>
						)}
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
