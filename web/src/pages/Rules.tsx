import { useState } from 'react';
import { Container, Title, Text, Box, Paper, Accordion, Group, Badge, Divider } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';

export default function RulesPage() {
	const [activeCommunityRule, setActiveCommunityRule] = useState<string | null>(null);
	const [activeRoleplayRule, setActiveRoleplayRule] = useState<string | null>(null);

	return (
		<MainLayout requireAuth={false}>
			<Container size='lg' py='xl'>
				<Paper withBorder p='xl' radius='md' mb='xl' bg='dark.8'>
					<Title order={2} mb='lg'>
						OdessaRP Regelsæt
					</Title>

					<Text size='lg' fw={700} c='red.4' mb='lg'>
						DET ER ENHVER SPILLERS EGET ANSVAR AT HOLDE SIG OPDATERET PÅ ODESSA'S REGELSÆT - NYE/ÆNDREDE REGLER VIL ALTID BLIVE MELDT UD I DISCORD
					</Text>

					{/* Community Guidelines Section */}
					<Box mb='xl'>
						<Title order={3} mb='md'>
							DISCORD & COMMUNITY GUIDELINES
						</Title>

						<Accordion value={activeCommunityRule} onChange={setActiveCommunityRule} radius='md' variant='filled'>
							<Accordion.Item value='C1'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C1
										</Badge>
										<Text fw={500}>Serverpersonale</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er IKKE tilladt at kontakte serverpersonale i privatbeskeder uden forudgående accept! Brug support kanaler på Discord.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C2'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C2
										</Badge>
										<Text fw={500}>Reklame</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Reklame og/eller links er IKKE tilladt. (@Content Kat er undtaget af denne regel)</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C3'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C3
										</Badge>
										<Text fw={500}>Chikane/racisme/mobning</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Du skal tale/skrive pænt om vores brugere. OdessaRP tager stor afstand til chikane/racisme/mobning af vores spillere, samt opfordringer til dette uden for serveren.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C4'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C4
										</Badge>
										<Text fw={500}>Voksent Community</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er IKKE tilladt at være provokerende uden grund over for andre spillere, dette kan medføre ban, vi ønsker en god tone og et voksent community! Det er IKKE tilladt at promovere hasardspil på nogle måde, dette glæder også skærmdeling af diverse sider.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C5'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C5
										</Badge>
										<Text fw={500}>Supportsager</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Du må ikke blande dig i andres admin-/supportsager</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C6'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C6
										</Badge>
										<Text fw={500}>Personlig Profil</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Din bruger hos OdessaRP er personlig og må ikke udleveres eller udlånes til anden part (eller tredje part)</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C7'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C7
										</Badge>
										<Text fw={500}>Følgende informationer gemmes</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Så snart du joiner OdessaRP, skal du være opmærksom på følgende ting bliver registeret og gemt:</Text>
									<Text ml='md'>- Dit steam ID.</Text>
									<Text ml='md'>- Din FiveM licensnøgle.</Text>
									<Text ml='md'>- Dit Discord ID og account ID.</Text>
									<Text ml='md'>- Din IP-adresse.</Text>
									<Text ml='md'>- Hardware ID.</Text>
									<Text mt='xs'>Hvis du har lavet noget strafbart på serveren, som går imod dansk lovgivning, vil disse oplysninger blive overdraget til politiet. Når du vælger at spille på OdessaRP, accepterer du disse sanktionsmuligheder.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C8'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C8
										</Badge>
										<Text fw={500}>Mikrofon og Voice Changer</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Du skal have en god mikrofon for at spille på vores servere. Voice-changer kan i specifikke tilfælde tillades, hvis det er godkendt i forbindelse med allowlist samtalen, eller hvis der ansøges om det inden RP-scenarier.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C9'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C9
										</Badge>
										<Text fw={500}>Reglbrud</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Husk altid at have et bevis og spiller-ID [HOME KNAPPEN], hvis du vil anklage en anden spiller for brud på reglerne. Husk også at lave en /report på den spiller du ønsker at anklage.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C10'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C10
										</Badge>
										<Text fw={500}>Optager Program</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Vi anbefaler brug af medal.tv, ShadowPlay, OBS, Gecata, XSplit, eller lignende. OBS: Video der ikke er fyldestgørende ved f.eks at mangle lyd, eller være klippet så staff ikke kan få det fulde billede, risikerer at blive afvist som gyldigt bevismateriale i supportsager.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C11'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C11
										</Badge>
										<Text fw={500}>Genstart / Crash</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Du må ikke bruge server genstart/crashes som en mulighed for at flygte fra en RP-situation fra tidligere. Du skal vente på involverede personer og fortsætte dit RP.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C12'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C12
										</Badge>
										<Text fw={500}>Combatlog</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er ikke tilladt at combatlogge, altså at logge ud for at slippe ud af et RP-scenarie.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C13'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C13
										</Badge>
										<Text fw={500}>Backseat Moderating</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Backseat moderating er ikke tilladt. Du må ikke udgive dig for at være staff osv.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C14'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C14
										</Badge>
										<Text fw={500}>Discord</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Hvis du forlader Odessa's Discord, skal du til ny allowlist samtale, for at få adgang til serveren igen.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C15'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C15
										</Badge>
										<Text fw={500}>OOC</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>De eneste personer, der må bryde karakter (OOC), er staff i forbindelse med support.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C16'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C16
										</Badge>
										<Text fw={500}>Færdiggør scenarie trods reglbrud</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Opstår der uenighed omkring udførslen af et RP-scenarie, skal der altid bestræbes på at fuldføre scenariet efter gældende RP-regler, derefter kan man gå i support med dertilhørende beviser for den uhensigtsmæssige udførsel. Bryd under ingen omstændigheder din karakter i hverken OOC-chat eller via voice-kommunikation.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C17'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C17
										</Badge>
										<Text fw={500}>Support</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Alle supportsager skal tages på Discord i samarbejde med en fra staff. (HUSK VIDEO OG ID)</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C18'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C18
										</Badge>
										<Text fw={500}>Ingame Problemer</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Hvis du oplever in-game-problemer (eksempelvis at sidde fast under jorden) Kontakt support.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C19'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C19
										</Badge>
										<Text fw={500}>Radio</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>OdessaRP's ingame radioer er de eneste godkendte radioer. Andre 3.-parts taleprogrammer er ikke tilladte at bruge, så længe du er in-game.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C20'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C20
										</Badge>
										<Text fw={500}>Hacking, Exploiting, Modding</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er givetvis ikke tilladt at hacke, exploite, modde eller på anden måde snyde. Dette resulterer i permanent ban uden varsel.</Text>
									<Text mt='xs'>Eksempler på dette kan være følgende:</Text>
									<Text ml='md'>- Stretching</Text>
									<Text ml='md'>- Mods der giver visuelle fordele (fx. ændring i field of view - brug af no night - brug af pvp graphic mods)</Text>
									<Text ml='md'>- Kill Effects</Text>
									<Text ml='md'>- Flawless Widescreen</Text>
									<Text ml='md'>- Diverse skins (F.eks skins der ændre våbnets farve til andet end Sort/Grå, eller ændre deres model, så de får indbygget sigte eller tilføjet andre visuelle konfigurationer.)</Text>
									<Text mt='xs'>Er man i tvivl omkring ovenstående, og har man en funktion, som måske kan høre under ovenstående. Så kontakt en staff, og få bekræftelse inden det tages i brug på serveren!</Text>
									<Text mt='xs'>Derved accepterer du også følgende TOS https://fini.ac/page/servers/terms-of-service når du spiller på OdessaRP. Det er altid spillerens eget ansvar, at sikre man spiller i overensstemmelse med Odessas regelsæt & TOS.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C21'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C21
										</Badge>
										<Text fw={500}>Bugs og Misbrug</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Finder man bugs, SKAL disse indberettes til staff øjeblikkeligt. Misbruger man disse, resulterer det i permanent ban uden varsel.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C22'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C22
										</Badge>
										<Text fw={500}>Transfer Items</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er ikke tilladt at 'transfer' items, penge, biler etc. i mellem dine personlige karakterer.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C23'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C23
										</Badge>
										<Text fw={500}>Snyd ved bilsalg</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er ikke tilladt at snyde ved salg/køb af bil hos brugtvogns forhandleren.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C24'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C24
										</Badge>
										<Text fw={500}>Emotes ved handlinger</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Du skal bruge handlinger, som passer bedst til den situation du står i, for at forbedre RP'en. Handlinger foretages ikke i køretøjer!</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C25'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C25
										</Badge>
										<Text fw={500}>Handel med rigtige penge</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er på ingen måde tilladt at handle med rigtige penge (eller andre ting af værdi) om ting inde i spillet. Dette strider også imod FiveM's egne Terms of Service. Opdages dette, vil det resultere i permanent ban.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C26'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C26
										</Badge>
										<Text fw={500}>Kommune Udstyr</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Man må ikke loote kommune udstyr. Det vil sige, at man under ingen omstændigheder må stjæle/være i besiddelse af Politi/Brand & Redning's udstyr, såsom tazer/politi stav/AssaultRifle/Tjeneste Pistol/Medkits osv.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C27'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C27
										</Badge>
										<Text fw={500}>Våbenlicens</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>En våben licens giver adgang til en musket hos våbenhandleren, Det er udelukkende tilladt at bruge denne musket til jagt! Bruges den til personfarligt RP, vil det medfører en advarsel.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C28'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C28
										</Badge>
										<Text fw={500}>Karakter CK/PK</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>PK: Dette betyder din karakter dør, men værdier overføres til en evt. ny karakter. (penge,biler osv) (Du kan IKKE PK din egen karakter)</Text>
									<Text>CK: Dette betyder din karakter dør, alt slettes (penge,biler osv) (selvmord kan til enhver tid vurderes som CK af staff)</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C29'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C29
										</Badge>
										<Text fw={500}>Ansøgning om PK</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Ønsker du en anden spiller PK'et, skal du oprette en CK/PK ansøgning. Her fremlægger du en velskrevet tekst samt begrundelse, for det ønskede PK. Scenariet kan først udføres når ansøgningen er godkendt.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C30'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C30
										</Badge>
										<Text fw={500}>Suicide By Cop</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Hvis du bevidst lader dig blive dræbt af politiet (Suicide by Cop), eller begår selvmord for at undgå en straf, vil dette medføre et CK.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C31'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C31
										</Badge>
										<Text fw={500}>Karakter Navn</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Dit Karakternavn SKAL stå her på Discord, så staff nemt kan identificere dig. Du behøver ikke skrive navnet på alle dine karaktere, men bare din main karakter.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='C32'>
								<Accordion.Control>
									<Group>
										<Badge color='blue' size='lg'>
											C32
										</Badge>
										<Text fw={500}>Gambling</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er ikke tilladt at streame gambling på Odessas Discord.</Text>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					</Box>

					<Divider my='xl' />

					{/* Roleplay Rules Section */}
					<Box>
						<Title order={3} mb='md'>
							ROLLESPILS REGLER
						</Title>

						<Accordion value={activeRoleplayRule} onChange={setActiveRoleplayRule} radius='md' variant='filled'>
							<Accordion.Item value='1'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§1
										</Badge>
										<Text fw={500}>RDM (Random DeathMatch)</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Hvis der ikke er noget RP-scenarie, som retfærdiggør, at man slår/skyder/stikker eller på anden måde laver en handling der resulterer i en anden spillers død.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='2'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§2
										</Badge>
										<Text fw={500}>VDM (Vehicle DeathMatch)</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Du må ikke bruge dit køretøj som våben, også selvom du ikke dræber personen. Derfor kører du ikke ind i et stillestående køretøj. Hvis man skal pitte en bil, skal det gøres så realistisk som muligt.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='3'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§3
										</Badge>
										<Text fw={500}>COPBAIT</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Copbait er IKKE tilladt. Der skal være en grund til at flygte fra politiet. Det er eksempelvis ikke god nok grund til at flygte, hvis du blot har kørt over for rødt lys.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='4'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§4
										</Badge>
										<Text fw={500}>FAIL RP</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Udfører din karakter en handling, som i situationen ikke giver mening for din karakterer. Så kan det anses som værende FailRP.</Text>
									<Text mt='xs'>Eksempel 1: Du opsøger politiet kort efter at du har været på flugt fra selvsamme politi.</Text>
									<Text mt='xs'>Eksempel 2: To spillere står med en igangværende RP samtale. I denne situation vil det være en forkert handling, at involvere sig i samtalen for udelukkende at handle destruktivt uden RP grundlag.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='5'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§5
										</Badge>
										<Text fw={500}>POWER GAMING</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>§5.1 Powergaming er ikke tilladt og dækker enhver urealistisk handling, der manipulerer spillets begrænsninger for egen fordel. Eksempler inkluderer at køre off-road i en lav sportsvogn, hoppe ud over en bro og straks kunne løbe væk, efter at man kun lige har overlevet faldet.</Text>
									<Text mt='md'>§5.2 Denne regel gælder også brug af køretøjer: Hvis man kører direkte ind i en væg eller falder mere end 20 meter, skal dette afspejles realistisk i ens spil. Kører man sit køretøj i vandet for at flygte fra et scenarie vil dette ligeledes blive betragtet som powergaming og kan, efter vurdering af staff, resultere i, at køretøjet slettes permanent.</Text>
									<Text mt='md'>(Bemærk, at brug af stuntjumps på Odessa stadig er tilladt.)</Text>
									<Text mt='md'>Andre former for powergaming inkluderer at ignorere effekten af flere tazerskud (3-5 stykker) samt at udføre spark/slag fra en motorcykel, hvilket også anses som powergaming.</Text>
									<Text mt='md'>Brud på denne regel vil, som ved alle regler, blive håndhævet af staff.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='6'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§6
										</Badge>
										<Text fw={500}>NLR</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Overhold altid NLR (New Life Rule). Du kan ikke huske hvad der lige er sket, hvis din karakter har været slået bevidstløs uden at blive genoplivet. Bliver man genoplivet, så kan man godt huske det foregående scenarie. Husk at en genoplivning skal være på sin plads. Bliver man for eksempel skudt i hovedet, så kan man selvfølgelig ikke blive genoplivet. Der skal være grundlag for at fortsætte scenariet efter en genoplivning. Flere genoplivninger (to eller flere genoplivninger) i samme scenarie, kan blive betragtet som Hævn RP, og kan udløse en advarsel.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='7'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§7
										</Badge>
										<Text fw={500}>METAGAMING</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Metagaming er forbudt: Du må ikke bruge viden, som din karakter ikke har fået igennem spillet, til at påvirke dine handlinger ingame.</Text>
									<Text mt='xs'>Det er ikke tilladt at dele din karakters tanker via en /me-kommando.</Text>
									<Text mt='xs'>Det er ikke tilladt at lyve i en /me-kommando.</Text>
									<Text mt='xs'>Dine karakterer må ikke have nogen form for kendskab til hinanden eller være i familie med hinanden.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='8'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§8
										</Badge>
										<Text fw={500}>FearRP</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
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
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='9'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§9
										</Badge>
										<Text fw={500}>OOC (Out Of Character)</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er strengt forbudt at bryde sin karakter. Bryder du din karakter, kan du blive udelukket, da dette ødelægger RP-scenarier. En Staff kan altid vurdere om noget er OOC snak.</Text>

									<Text mt='md'>Eksempler på, hvad vi betragter som OOC:</Text>
									<Text ml='md'>"Jeg skal lige noget i hovedet" / "Jeg har noget i lejligheden"</Text>
									<Text ml='md'>"Det var en nervefejl" / "Hvilken nerve skal jeg bruge"</Text>
									<Text ml='md'>"Hov, lige to sekunder"</Text>
									<Text ml='md'>"Jeg skal lige i kommunen" / "Jeg spiser lige Suppe"</Text>
									<Text ml='md'>"Vindermentalitet"</Text>

									<Text mt='md'>Staff kan i tilfælde af support give tilladelse til at snakke OOC.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='10'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§10
										</Badge>
										<Text fw={500}>Voldtægt</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Voldtægts-RP er ikke tilladt.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='11'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§11
										</Badge>
										<Text fw={500}>Røveri/Tyveri</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Det er IKKE tilladt at røve en anden spiller for egen økonomisk vinding (kedsomhed), eller uden foregående RP, (Det er dog kun tilladt at røve personen for værdier, de har på sig. Det er eksempelvis ikke tilladt at tvinge en person til at overdrage en bil eller værdier, de ikke har på sig).</Text>
									<Text mt='xs'>Det er IKKE tilladt at stjæle køretøjer og tømme dem for materialer/våben osv., for egen økonomisk vinding (kedsomhed), eller uden foregående RP.</Text>
									<Text mt='xs'>Det er IKKE tilladt at stjæle Kommune udstyr (politi/læge med mere) F.eks. Våben, ammunition, håndjern, tazer, Piller, medkits osv.</Text>
									<Text mt='xs'>OBS! Ved gyldigt RP grundlag er det tilladt at stjæle tjeneste køretøjer.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='12'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§12
										</Badge>
										<Text fw={500}>Bander</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Civile må ikke agere bande (tøj/biler/forsamlinger i ens farvet tøj).</Text>
									<Text mt='xs'>Bander skal godkendes (ansøgning/historie/bande start).</Text>
									<Text mt='xs'>Som bandemedlem, skal man tage et videoklip hver gang man slår en spiller ihjel. Grund: Man kan fremvise man har rent mel i posen, i forhold til eventuelle supportsager, omkring sigtekorn, visuelle fordele, RDM, eller andet. Disse klip skal gemmes i 24 timer, derefter kan de slettes.</Text>
									<Text mt='xs'>(irl bandenavne accepteres ikke på Odessa & det er kun tilladt at have 1 bandekarakter)</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='13'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§13
										</Badge>
										<Text fw={500}>Politi</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Politiet må under ingen omstændigheder tage udstyr fra lagre mv. hverken for økonomisk vinding eller dele det ud.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='14'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§14
										</Badge>
										<Text fw={500}>Bank & Butiksrøverier</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
									<Text>Røverier skal planlægges grundigt. Det er ikke tilladt at udføre serie røverier. Hvis et røveri påbegyndes, skal det færdiggøres, og man må ikke forlade området uden at fuldføre det.</Text>
									<Text mt='xs'>Det er tilladt at tage gidsler, så længe de inddrages aktivt i scenariet.</Text>
									<Text mt='xs'>Der må ikke skydes, før der har været forsøg på forhandlinger.</Text>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='15'>
								<Accordion.Control>
									<Group>
										<Badge color='green' size='lg'>
											§15
										</Badge>
										<Text fw={500}>Regler for KOS</Text>
									</Group>
								</Accordion.Control>
								<Accordion.Panel>
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
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					</Box>
				</Paper>
			</Container>
		</MainLayout>
	);
}
