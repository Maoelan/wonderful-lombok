<script>
  import { getCopy } from './i18n.js';
  export let faqs = [];
  export let locale = 'id';
  $: c = getCopy(locale);
</script>

{#if faqs.length}
<section class="faq section studio-faq" id="faq" aria-labelledby="faq-title" data-whatsapp-float-avoid itemscope itemtype="https://schema.org/FAQPage">
  <div class="faq-intro"><h2 id="faq-title">{c.faqHeading}</h2></div>
  <div class="faq-list">{#each faqs as faq}<details itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><summary itemprop="name">{faq.question}</summary><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><div class="rich-content" itemprop="text">{@html faq.answer}</div></div></details>{/each}</div>
</section>
{/if}
