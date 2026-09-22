<script lang="ts">
	import { Panel } from '$lib/components';
	import Keyboard from '$lib/trainer/Keyboard.svelte';
	import Hands from '$lib/trainer/Hands.svelte';
	import { progressStore } from '$lib/storage/store.svelte';
</script>

<svelte:head>
	<title>Om – Fingerflyt</title>
</svelte:head>

<div class="mb-8 max-w-[64ch]">
	<h1 class="text-2xl font-bold tracking-tight text-ink">Om Fingerflyt</h1>
	<p class="mt-3 text-muted">
		Fingerflyt er en fingersettingstrener for norsk tastatur. For hvert tegn du skal skrive, viser
		appen hvilken finger som bør trykke det — i teksten, i hintet, på tastaturet og på hendene.
		Målet er å bygge riktige vaner gjennom stadig visuell påminnelse, samtidig som appen registrerer
		hvilke taster du bommer på og hvor treg du er, slik at øvingen kan tilpasses deg.
	</p>
</div>

<Panel padding="lg" class="mb-5">
	<h2 class="text-lg font-bold text-ink">Fingersonene</h2>
	<p class="mt-2 max-w-[60ch] text-muted">
		Hver tast hører til én av fem fingre på hver hånd. Fargen går igjen på tastaturet, hendene,
		heatmapet og diagrammene, slik at du alltid kan kjenne igjen hvilken finger som er i bruk.
	</p>
	<div class="mt-6">
		<Hands active={[]} hold={[]} />
	</div>
</Panel>

<Panel padding="lg" class="mb-5 max-w-[64ch]">
	<h2 class="text-lg font-bold text-ink">Grunnstillingen</h2>
	<p class="mt-2 text-muted">
		Mellom hvert tastetrykk hviler fingrene i grunnstillingen: de fire venstre fingrene på A, S, D
		og F, og de fire høyre fingrene på J, K, L og tasten rett til høyre for L. Derfra når du alle
		andre taster uten å se ned. F og J har en liten markør på tastaturet i appen — akkurat som
		kulene du kjenner på et fysisk tastatur — så pekefingrene kan finne hjem av seg selv.
	</p>
</Panel>

<Panel padding="lg" class="mb-5">
	<h2 class="text-lg font-bold text-ink">Tastaturet fargelagt etter fingersone</h2>
	<p class="mt-2 max-w-[60ch] text-muted">
		Fargene under hver tast viser hvilken finger som er riktig for den, uavhengig av hvilken finger
		du faktisk bruker.
	</p>
	<div class="mt-6">
		<Keyboard
			layout={progressStore.layoutIndex.layout}
			targetKeyId={null}
			holdKeyId={null}
			wrongKeyId={null}
			pressedKeyId={null}
		/>
	</div>
</Panel>

<Panel padding="lg" class="mb-5 max-w-[64ch]">
	<h2 class="text-lg font-bold text-ink">Hvorfor holdes Shift med motsatt hånd?</h2>
	<p class="mt-2 text-muted">
		Shift trykkes alltid med lillefingeren på hånden som <em>ikke</em> trykker selve tegnet. Skal du skrive
		en stor K — som trykkes med høyre langfinger — holder du venstre Shift med venstre lillefinger. Slik
		kan hendene jobbe samtidig i stedet for at én hånd må vri seg for å nå både tegn og skifttast, noe
		som er både raskere og roligere for håndleddet.
	</p>
</Panel>

<Panel padding="lg" class="max-w-[64ch]">
	<h2 class="text-lg font-bold text-ink">Tips for bedre fingerbruk</h2>
	<ul class="mt-3 flex flex-col gap-2.5 text-muted">
		<li>Øv litt hver dag. Korte, hyppige økter gir bedre muskelminne enn sjeldne, lange.</li>
		<li>
			Prioriter nøyaktighet fremfor fart i starten. Farten kommer av seg selv når fingrene sitter
			riktig.
		</li>
		<li>
			Se på varmekartet og tabellen per finger på fremgangssiden for å se hvilke taster som trenger
			mer øvelse.
		</li>
		<li>
			La «Svake taster» ta over når den låses opp. Den øver spesifikt på ordene som treffer dine
			tregeste og mest feilutsatte taster.
		</li>
	</ul>
</Panel>
