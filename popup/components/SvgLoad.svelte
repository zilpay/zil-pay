<script lang="ts">
    let {
        src,
        ...rest
    }: {
        src: string;
        [key: string]: any;
    } = $props();

    let content = $state('');

    async function loadSvg() {
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error('Failed to fetch svg');
            content = await response.text();
        } catch (error) {
            console.error(error);
        }
    }

    $effect(() => {
        loadSvg();
    });

    const attributes = $derived(
        Object.entries(rest)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ')
    );

    const svgContent = $derived(() => {
        if (!content) return '';
        const innerContent = content
            .replace(/^<svg[^>]*>/, '')
            .replace(/<\/svg>$/, '');
        return `<svg ${attributes}>${innerContent}</svg>`;
    });
</script>

{@html svgContent()}
