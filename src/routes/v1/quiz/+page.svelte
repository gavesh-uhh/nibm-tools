<script lang="ts">
  import Input from "$lib/components/ui/input/input.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Search, Loader2, Sparkles, RefreshCcw, Check, X, Settings2 } from "lucide-svelte";
  import { onMount } from "svelte";
  import { marked } from "marked";
  import markedKatex from "marked-katex-extension";
  import "katex/dist/katex.min.css";

  marked.use(markedKatex({ 
    throwOnError: false,
    nonStandard: true
  }));

  let searchBarInput = $state("");
  let isSearching = $state(false);
  let papers: Paper[] = $state([]);
  let selectedPapers: Paper[] = $state([]);
  
  let questionType = $state("Theory");
  let additionalContext = $state("");
  let showAdvanced = $state(false);
  let showAnalysis = $state(false);
  
  let isGenerating = $state(false);
  let analysisText = $state("");
  let generatedQuestions: { question: string; answer: string; source: string }[] = $state([]);
  let errorMsg = $state("");
  let searchDebounce: ReturnType<typeof setTimeout> | undefined = undefined;

  const extractData = (str: string) => {
    // Brute force structural completion to securely parse streaming JSON
    const endings = ['', '"]}]}', '"}]}', '}]}', ']}', '}'];
    for (const end of endings) {
      try {
        const parsed = JSON.parse(str + end);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch(e) {}
    }
    return {};
  };

  const handleSearchInput = () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => searchPapers(), 400);
  };

  const searchPapers = async () => {
    isSearching = true;
    errorMsg = "";
    try {
      const q = encodeURIComponent(searchBarInput.trim() || "Paper");
      const res = await fetch("/api/papers?q=" + q);
      if (!res.ok) throw new Error("Failed to fetch papers");
      const data = await res.json();
      papers = Array.isArray(data) ? data : (data.content || []);
    } catch (e: any) {
      errorMsg = e.message;
    } finally {
      isSearching = false;
    }
  };

  const toggleSelection = (paper: Paper) => {
    if (selectedPapers.find(p => p.url === paper.url)) {
      selectedPapers = selectedPapers.filter(p => p.url !== paper.url);
    } else {
      selectedPapers = [...selectedPapers, paper];
    }
  };

  const generateQuestions = async () => {
    if (selectedPapers.length === 0) return;
    isGenerating = true;
    errorMsg = "";
    analysisText = "";
    generatedQuestions = [];
    
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          papers: selectedPapers,
          count: 5,
          questionType,
          additionalContext
        })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream not available");
      
      const decoder = new TextDecoder();
      let rawJsonBuf = "";
      let receivedQuestions = false;
      
      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) break;
          
          rawJsonBuf += decoder.decode(value, { stream: true });
          
          const extracted = extractData(rawJsonBuf) as any;
          if (extracted.analysis) analysisText = extracted.analysis;
          if (extracted.questions && extracted.questions.length > 0) {
            generatedQuestions = extracted.questions;
            receivedQuestions = true;
          }
        } catch (readErr: any) {
          if (receivedQuestions) {
            // If the stream dies (e.g. TypeError: terminated), but we got questions, keep them!
            console.warn("Stream terminated early, but preserving completed questions.", readErr);
            break; 
          } else {
            throw readErr;
          }
        }
      }
    } catch (e: any) {
      errorMsg = e.message || "Failed to generate questions.";
    } finally {
      isGenerating = false;
    }
  };

  onMount(() => {
    searchPapers();
  });
</script>

<div class="h-full flex flex-col md:flex-row gap-3 p-3 md:p-4">
  <!-- Left Panel: Search & Select -->
  <div class="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
    <div class="flex flex-col gap-1">
      <h1 class="text-xl font-bold flex items-center gap-2">
        Quiz Generator (BETA)
      </h1>
      <p class="text-xs text-muted-foreground">Select materials to generate questions from.</p>
    </div>
    
    <div class="flex gap-2">
      <Input
        bind:value={searchBarInput}
        placeholder="Subject e.g. CN, SE..."
        oninput={handleSearchInput}
      />
      <Button size="icon" variant="secondary" onclick={searchPapers} disabled={isSearching}>
        {#if isSearching}
          <Loader2 class="w-4 h-4 animate-spin" />
        {:else}
          <Search class="w-4 h-4" />
        {/if}
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[250px] md:min-h-[400px] pr-1">
      {#each papers as paper}
        {@const isSelected = selectedPapers.find(p => p.url === paper.url)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          class="p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer {isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/50 bg-card hover:border-primary/40'}"
          onclick={() => toggleSelection(paper)}
        >
          <div class="flex justify-between items-start gap-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold truncate text-foreground">{paper.subject || "Unknown Subject"}</h3>
              <p class="text-xs text-muted-foreground mt-0.5 truncate">{paper.batch || "Unknown Batch"}</p>
            </div>
            <div class="flex-shrink-0 mt-0.5">
              {#if isSelected}
                <div class="text-primary rounded-full bg-primary/20 p-0.5">
                  <Check class="w-3 h-3" strokeWidth={3} />
                </div>
              {:else}
                 <div class="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
      {#if papers.length === 0 && !isSearching}
        <div class="flex flex-col items-center justify-center py-6 opacity-60">
          <Search class="w-8 h-8 mb-2 text-muted-foreground" />
          <p class="text-sm text-center text-muted-foreground">No papers found.</p>
        </div>
      {/if}
    </div>
  </div>

  <div class="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-4 h-full flex-1">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end bg-card rounded-xl shadow-sm gap-3">
      <div class="flex-1">
        <h2 class="font-medium text-sm text-foreground mb-1.5 flex items-center gap-2">
          Selected Context 
          <span class="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{selectedPapers.length}</span>
        </h2>
        <div class="flex flex-wrap gap-2">
          {#each selectedPapers as selected}
            <span class="text-[11px] font-medium bg-muted/50 border border-border text-foreground px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
              <span class="truncate max-w-[120px]">{selected.batch + " " + selected.subject || "Paper"}</span>
              <button class="hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors" onclick={() => toggleSelection(selected)}>
                <X class="w-3 h-3" />
              </button>
            </span>
          {/each}
          {#if selectedPapers.length === 0}
            <span class="text-xs text-muted-foreground italic">Select papers from the list to begin.</span>
          {/if}
        </div>
      </div>
      <Button 
        onclick={generateQuestions} 
        disabled={selectedPapers.length === 0 || isGenerating}
        class="min-w-[150px] sm:self-end w-full sm:w-auto rounded-xl font-semibold shadow-sm"
      >
        {#if isGenerating}
          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
          Analyzing...
        {:else}
          <Sparkles class="w-4 h-4 mr-2" />
          Generate
        {/if}
      </Button>
    </div>

    {#if selectedPapers.length > 0}
      <div class="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-medium text-muted-foreground mr-1">Focus Mode:</span>
          <button 
            class="px-3 py-1 text-[11px] sm:text-xs rounded-full border transition-all {questionType === 'Theory' ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-sm' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'}"
            onclick={() => questionType = 'Theory'}
          >
            Theory
          </button>
          <button 
            class="px-3 py-1 text-[11px] sm:text-xs rounded-full border transition-all {questionType === 'Practice' ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-sm' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'}"
            onclick={() => questionType = 'Practice'}
          >
            Practice (Problem Solving)
          </button>
          
          <label class="ml-1 sm:ml-2 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors user-select-none">
            <input type="checkbox" bind:checked={showAnalysis} class="w-3 h-3 rounded-sm border-border accent-primary cursor-pointer" />
            Show Thought Process
          </label>
          
          <button 
            class="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
            onclick={() => showAdvanced = !showAdvanced}
          >
            <Settings2 class="w-3 h-3" /> {showAdvanced ? 'Hide Context' : 'Add Context'}
          </button>
        </div>
        
        {#if showAdvanced}
          <div class="animate-in fade-in slide-in-from-top-1">
            <textarea 
              bind:value={additionalContext}
              placeholder="Additional instructions (e.g. Focus on Chapter 3, format as true/false, make equations difficult...)"
              class="w-full text-sm bg-card border border-border/60 shadow-sm rounded-xl p-3 resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            ></textarea>
          </div>
        {/if}
      </div>
    {/if}

    {#if errorMsg}
      <div class="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
        <X class="w-4 h-4" /> {errorMsg}
      </div>
    {/if}

    <div class="flex-1 relative border border-border/60 rounded-xl bg-card shadow-sm min-h-[300px] overflow-hidden flex flex-col">
      <!-- Decorative background blurs locked cleanly behind overflow-hidden -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div class="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
      
      <!-- Inner scroll container -->
      <div class="flex-1 overflow-y-auto p-3 sm:p-5 markdown-body relative z-10 w-full flex flex-col">
      {#if isGenerating && generatedQuestions.length === 0 && !analysisText}
        <div class="h-full flex flex-col items-center justify-center text-muted-foreground space-y-8 animate-in fade-in duration-300">
          <div class="relative flex items-center justify-center w-24 h-24">
            <div class="absolute inset-0 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin duration-1000"></div>
            <div class="bg-primary/5 p-4 rounded-full animate-pulse shadow-inner">
              <Sparkles class="w-8 h-8 text-primary" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <h3 class="text-lg font-semibold text-foreground animate-pulse">
              Synthesizing Material
            </h3>
            <p class="text-sm text-muted-foreground animate-pulse max-w-[280px]">Deeply analyzing your context documents down to the wire...</p>
          </div>
        </div>
      {:else if analysisText || generatedQuestions.length > 0}
        <div class="flex flex-col gap-2 w-full h-full animate-in fade-in duration-500 pb-8">
          
          {#if analysisText}
            {#if showAnalysis}
              <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 mb-4 shadow-sm relative overflow-hidden shrink-0 max-w-full w-full">
                 <div class="flex items-center gap-2 mb-3 max-w-full">
                   <Sparkles class="w-4 h-4 text-primary shrink-0" />
                   <h3 class="font-semibold text-primary text-sm tracking-tight truncate">Chain of Thought Analysis</h3>
                   {#if isGenerating && generatedQuestions.length === 0}
                      <Loader2 class="w-3 h-3 text-primary animate-spin ml-2 shrink-0" />
                   {/if}
                 </div>
                 <p class="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">{analysisText}</p>
              </div>
            {:else if isGenerating && generatedQuestions.length === 0}
              <div class="flex items-center justify-center py-8 animate-in fade-in duration-300 w-full">
                 <div class="flex items-center gap-3 px-4 py-2 bg-muted/40 rounded-full border border-border/50 shadow-sm">
                    <Loader2 class="w-4 h-4 text-primary animate-spin" />
                    <span class="text-xs font-medium text-muted-foreground">Deeply analyzing texts...</span>
                 </div>
              </div>
            {/if}
          {/if}

          {#each generatedQuestions as item, i}
             <div class="py-4 border-b border-border/40 last:border-0 group transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="text-primary text-[10px] font-bold tracking-wider">Question {i + 1}.</span>
                  <span class="text-[10px] text-muted-foreground ml-auto bg-muted/50 px-2 py-0.5 rounded-full truncate max-w-[150px] sm:max-w-[250px]" title={item.source}>{item.source || "Context generating..."}</span>
                </div>
                <div class="font-medium text-foreground text-[15px] sm:text-base mb-2.5 leading-snug group-hover:text-primary transition-colors markdown-body">
                  {@html marked.parse(item.question || "")}
                </div>
                {#if item.answer}
                  <div class="bg-muted/20 border border-border/30 rounded-lg p-4 text-sm text-muted-foreground relative mt-2 animate-in fade-in zoom-in-95 duration-300">
                    <div class="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/30 rounded-l-lg"></div>
                    <strong class="text-foreground font-medium block mb-2">Answer:</strong>
                    <div class="leading-relaxed markdown-body">
                      {@html marked.parse(item.answer)}
                    </div>
                  </div>
                {/if}
             </div>
          {/each}

          {#if isGenerating && generatedQuestions.length > 0}
             <div class="py-6 flex items-center justify-center">
                <Loader2 class="w-5 h-5 text-primary animate-spin" />
             </div>
          {/if}

        </div>
      {:else}
        <div class="h-full w-full flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in duration-500">
          <Sparkles class="w-10 h-10 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
          <h3 class="text-lg font-medium text-foreground mb-2">
            Generate Questions
          </h3>
          <p class="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Select course materials from the list and hit <strong class="text-foreground font-medium">Generate</strong> to build a personalized AI practice quiz.
          </p>
        </div>
      {/if}
      </div>
    </div>
  </div>
</div>

<style>

  .markdown-body :global(h1),
  .markdown-body :global(h2),
  .markdown-body :global(h3) {
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    color: hsl(var(--foreground));
  }
  .markdown-body :global(p) { margin-bottom: 1em; line-height: 1.6; color: hsl(var(--muted-foreground)); }
  .markdown-body :global(ul) { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
  .markdown-body :global(ol) { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
  .markdown-body :global(li) { margin-bottom: 0.25em; color: hsl(var(--muted-foreground)); }
  .markdown-body :global(strong) { font-weight: 600; color: hsl(var(--foreground)); }
  .markdown-body :global(em) { color: hsl(var(--foreground)); }
  .markdown-body :global(code) { 
    background-color: hsl(var(--muted)); 
    padding: 0.2em 0.4em; 
    border-radius: 0.25em; 
    font-size: 0.9em; 
  }
  .markdown-body :global(pre) {
    background-color: hsl(var(--muted));
    padding: 1em;
    border-radius: 0.5em;
    overflow-x: auto;
    margin-bottom: 1em;
  }
  .markdown-body :global(pre code) {
    background-color: transparent;
    padding: 0;
  }
  
  /* KaTeX specific styling fixes */
  .markdown-body :global(.katex-display) {
    margin: 1.5em 0;
    padding: 1em 0;
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100%;
    display: flex;
    justify-content: center;
  }
  .markdown-body :global(.katex) {
    font-size: 1.1em;
    line-height: 1.2;
    text-rendering: optimizeLegibility;
  }
  .markdown-body :global(.katex-html) {
    overflow-x: auto;
    max-width: 100%;
  }
</style>
